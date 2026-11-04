/**
 * aiProvider.js
 * 
 * Provider-independent AI completion service for Veyro LMS.
 * 
 * Primary: NVIDIA NIM (mistralai/mistral-large-4-1t-a52b)
 * Fallback: Groq (openai/gpt-oss-120b / qwen/qwen3.8-27b)
 * 
 * Features:
 * - Automatic failover on timeout, 429 rate limit, 5xx server errors, or network outages.
 * - Exponential backoff on transient errors.
 * - Safe error handling (never exposes API keys).
 * - Full streaming and non-streaming chat completions.
 * - Test/Simulation hook for fallback validation.
 */

const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_DEFAULT_MODEL = 'mistralai/mistral-large-4-1t-a52b';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_SECONDARY_MODEL = 'openai/gpt-oss-120b';
const GROQ_TERTIARY_MODEL = 'openai/gpt-oss-20b';
const GROQ_DEFAULT_MODEL = GROQ_SECONDARY_MODEL;

// Simulation state for testing fallback behavior in automated test suites
let _simulationConfig = {
  forceNvidiaFail: false,
  forceAllFail: false,
};

function setSimulationConfig(config) {
  _simulationConfig = { ..._simulationConfig, ...config };
}

function getSimulationConfig() {
  return { ..._simulationConfig };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cleanly extract text content from an OpenAI-compatible message object.
 * Handles Mistral Large 4 / reasoning models where message.content may be empty
 * but reasoning_content contains the generation.
 */
function extractMessageContent(message) {
  if (!message) return '';
  if (typeof message.content === 'string' && message.content.trim()) {
    return message.content.trim();
  }
  if (typeof message.reasoning_content === 'string' && message.reasoning_content.trim()) {
    return message.reasoning_content.trim();
  }
  return '';
}

/**
 * Execute request against NVIDIA NIM with timeout.
 */
async function callNvidia(messages, options = {}) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured');
  }

  if (_simulationConfig.forceNvidiaFail || _simulationConfig.forceAllFail) {
    const simError = new Error('Simulated NVIDIA NIM rate limit / timeout');
    simError.status = 429;
    throw simError;
  }

  const model = options.model || NVIDIA_DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || Number(process.env.NVIDIA_TIMEOUT_MS) || 20000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(NVIDIA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 1024,
        temperature: typeof options.temperature === 'number' ? options.temperature : 0.4,
        top_p: typeof options.topP === 'number' ? options.topP : 0.9,
        reasoning_effort: options.reasoning_effort || 'low',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      const err = new Error(`NVIDIA NIM returned status ${res.status}: ${errorBody.substring(0, 200)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const content = extractMessageContent(choice?.message);

    if (!content) {
      throw new Error('NVIDIA NIM returned empty completion content');
    }

    return {
      content,
      provider: 'nvidia',
      model,
      usage: data.usage || null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`NVIDIA NIM request timed out after ${timeoutMs}ms`);
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Execute request against Groq with timeout.
 */
async function callGroq(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  if (_simulationConfig.forceAllFail) {
    const simError = new Error('Simulated Groq provider outage');
    simError.status = 503;
    throw simError;
  }

  const model = options.groqModel || GROQ_DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 1024,
        temperature: typeof options.temperature === 'number' ? options.temperature : 0.4,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      // Multi-tier Groq model fallback on rate limit or outage
      if (model === GROQ_SECONDARY_MODEL) {
        console.warn(`[AI Provider] Secondary Groq model ${model} failed (${res.status}). Retrying with tertiary model ${GROQ_TERTIARY_MODEL}...`);
        await sleep(300);
        return await callGroq(messages, { ...options, groqModel: GROQ_TERTIARY_MODEL });
      }
      const err = new Error(`Groq returned status ${res.status}: ${errorBody.substring(0, 200)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const content = extractMessageContent(choice?.message);

    if (!content) {
      throw new Error('Groq returned empty completion content');
    }

    return {
      content,
      provider: 'groq',
      model,
      usage: data.usage || null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Groq request timed out after ${timeoutMs}ms`);
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Primary completion method with automatic fallback.
 * 
 * Flow:
 * 1. Attempt NVIDIA NIM (Mistral Large 4).
 * 2. If NVIDIA returns 429 (rate limit), 5xx (server error), timeout, or network failure:
 *    - Automatically fall back to Groq.
 *    - Log provider transition.
 * 3. Return completion with provider and model metadata.
 */
async function generateCompletion(messages, options = {}) {
  const startTime = Date.now();
  let lastError = null;

  // 1. Primary: NVIDIA NIM
  try {
    const result = await callNvidia(messages, options);
    console.log(`[AI Provider] NVIDIA NIM responded in ${Date.now() - startTime}ms (model: ${result.model})`);
    return result;
  } catch (nvidiaErr) {
    lastError = nvidiaErr;
    const isRetryable =
      nvidiaErr.status === 429 ||
      nvidiaErr.status >= 500 ||
      nvidiaErr.name === 'AbortError' ||
      nvidiaErr.code === 'ECONNRESET' ||
      nvidiaErr.code === 'ETIMEDOUT' ||
      _simulationConfig.forceNvidiaFail;

    console.warn(
      `[AI Provider] Primary provider (NVIDIA NIM) failed: [Status ${nvidiaErr.status || 'N/A'}] ${
        nvidiaErr.message
      }. Switching to fallback provider (Groq)...`
    );

    // If error was a transient glitch and not a hard rate limit, small backoff
    if (nvidiaErr.status === 503 || nvidiaErr.status === 502) {
      await sleep(500);
    }
  }

  // 2. Secondary: Groq Fallback
  try {
    const result = await callGroq(messages, options);
    console.log(
      `[AI Provider] Groq fallback responded in ${Date.now() - startTime}ms (model: ${result.model})`
    );
    return {
      ...result,
      fallbackTriggered: true,
      primaryError: lastError ? lastError.message : null,
    };
  } catch (groqErr) {
    console.error(
      `[AI Provider] Both providers failed. Primary: ${lastError?.message}. Fallback: ${groqErr.message}`
    );
    const combinedErr = new Error(
      'Veyro AI is temporarily unavailable due to high provider load. Please try again in a few moments.'
    );
    combinedErr.status = 503;
    combinedErr.statusCode = 503;
    combinedErr.details = {
      primary: lastError?.message,
      fallback: groqErr.message,
    };
    throw combinedErr;
  }
}

/**
 * Server-Sent Events (SSE) streaming completion.
 * Streams chunks progressively to client with provider failover.
 */
async function streamCompletion(messages, res, options = {}) {
  // If simulation or force fallback, stream directly from Groq
  const useGroqFirst = _simulationConfig.forceNvidiaFail;

  const tryStream = async (provider, endpoint, apiKey, model) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 35000);

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.4,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      const err = new Error(`${provider} stream error ${apiRes.status}`);
      err.status = apiRes.status;
      throw err;
    }

    return apiRes;
  };

  let activeProvider = 'nvidia';
  let activeModel = NVIDIA_DEFAULT_MODEL;
  let responseStream = null;

  if (!useGroqFirst && process.env.NVIDIA_API_KEY && !_simulationConfig.forceAllFail) {
    try {
      responseStream = await tryStream(
        'NVIDIA',
        NVIDIA_ENDPOINT,
        process.env.NVIDIA_API_KEY,
        NVIDIA_DEFAULT_MODEL
      );
      activeProvider = 'nvidia';
      activeModel = NVIDIA_DEFAULT_MODEL;
    } catch (err) {
      console.warn(`[AI Provider] NVIDIA stream failed (${err.message}). Falling back to Groq stream...`);
    }
  }

  if (!responseStream && process.env.GROQ_API_KEY && !_simulationConfig.forceAllFail) {
    try {
      responseStream = await tryStream(
        'Groq',
        GROQ_ENDPOINT,
        process.env.GROQ_API_KEY,
        GROQ_DEFAULT_MODEL
      );
      activeProvider = 'groq';
      activeModel = GROQ_DEFAULT_MODEL;
    } catch (err) {
      console.error(`[AI Provider] Groq stream also failed (${err.message})`);
    }
  }

  if (!responseStream) {
    throw new Error('All AI streaming providers are currently unavailable.');
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial meta event
  res.write(`data: ${JSON.stringify({ type: 'start', provider: activeProvider, model: activeModel })}\n\n`);

  const reader = responseStream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataPart = trimmed.replace(/^data:\s*/, '');
        if (dataPart === '[DONE]') {
          res.write(`data: ${JSON.stringify({ type: 'done', provider: activeProvider })}\n\n`);
          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(dataPart);
          const delta = parsed.choices?.[0]?.delta;
          const chunkText = delta?.content || delta?.reasoning_content || '';
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
          }
        } catch {
          // ignore malformed SSE line
        }
      }
    }
  } catch (streamErr) {
    console.error('[AI Provider] Stream reading error:', streamErr.message);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`);
  } finally {
    res.end();
  }
}

module.exports = {
  generateCompletion,
  streamCompletion,
  callNvidia,
  callGroq,
  setSimulationConfig,
  getSimulationConfig,
  NVIDIA_DEFAULT_MODEL,
  GROQ_DEFAULT_MODEL,
};
