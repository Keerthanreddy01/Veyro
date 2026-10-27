/**
 * Server and Client shared algorithms for Veyro LMS Video Watch Progress Auditing.
 * Handles continuous range merging, wall-clock jitter tolerance, and 90% threshold verification.
 */

/**
 * Converts a Set or Array of integer seconds into disjoint sorted ranges.
 * Example: [0, 1, 2, 5, 6, 7] -> [{ start: 0, end: 2 }, { start: 5, end: 7 }]
 * @param {Set<number>|number[]} secondsCollection
 * @returns {Array<{ start: number, end: number }>}
 */
function setToRanges(secondsCollection) {
  if (!secondsCollection) return [];
  const arr = Array.from(secondsCollection)
    .map(Number)
    .filter((n) => !isNaN(n) && n >= 0)
    .sort((a, b) => a - b);

  if (arr.length === 0) return [];

  const ranges = [];
  let start = arr[0];
  let end = arr[0];

  for (let i = 1; i < arr.length; i++) {
    const val = arr[i];
    if (val === end) {
      continue; // Duplicate
    } else if (val === end + 1) {
      end = val; // Contiguous
    } else {
      ranges.push({ start, end });
      start = val;
      end = val;
    }
  }
  ranges.push({ start, end });
  return ranges;
}

/**
 * Reconstructs a Set of integer seconds from a list of ranges.
 * @param {Array<{ start: number, end: number }>} ranges
 * @returns {Set<number>}
 */
function rangesToSet(ranges) {
  const set = new Set();
  if (!Array.isArray(ranges)) return set;
  for (const r of ranges) {
    if (!r) continue;
    const s = Math.max(0, Math.floor(Number(r.start) || 0));
    const e = Math.max(s, Math.floor(Number(r.end) || 0));
    for (let i = s; i <= e; i++) {
      set.add(i);
    }
  }
  return set;
}

/**
 * Merges two lists of ranges and returns the minimal disjoint set of ranges.
 * @param {Array<{ start: number, end: number }>} r1
 * @param {Array<{ start: number, end: number }>} r2
 * @returns {Array<{ start: number, end: number }>}
 */
function mergeRanges(r1 = [], r2 = []) {
  const combined = [...(Array.isArray(r1) ? r1 : []), ...(Array.isArray(r2) ? r2 : [])];
  if (combined.length === 0) return [];

  // Filter & normalize
  const valid = combined
    .map((r) => ({
      start: Math.max(0, Math.floor(Number(r.start) || 0)),
      end: Math.max(0, Math.floor(Number(r.end) || 0)),
    }))
    .filter((r) => r.end >= r.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  if (valid.length === 0) return [];

  const merged = [];
  let current = { ...valid[0] };

  for (let i = 1; i < valid.length; i++) {
    const next = valid[i];
    if (next.start <= current.end + 1) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
}

/**
 * Counts the total unique seconds covered by a list of ranges.
 * @param {Array<{ start: number, end: number }>} ranges
 * @returns {number}
 */
function countUniqueSeconds(ranges) {
  const merged = mergeRanges(ranges);
  let total = 0;
  for (const r of merged) {
    // Both start and end second indices are inclusive (e.g. 0 to 2 is seconds 0, 1, 2 = 3 seconds)
    total += r.end - r.start + 1;
  }
  return total;
}

/**
 * Authoritative watch percentage calculation.
 * @param {number} watchedSec Total unique watched seconds
 * @param {number} durationSec Authoritative duration in seconds
 * @param {boolean} isCompleted Whether the server has marked completion
 * @returns {{ percentage: number, isEligible: boolean }}
 */
function calculateWatchProgress(watchedSec, durationSec, isCompleted = false) {
  const duration = Math.max(1, Number(durationSec) || 1);
  const watched = Math.max(0, Math.min(duration, Number(watchedSec) || 0));
  const rawPercentage = Math.min(100, Math.max(0, Math.round((watched / duration) * 100)));
  const isEligible = isCompleted || (duration > 0 && watched >= duration * 0.9);
  const percentage = isEligible ? Math.max(90, rawPercentage) : rawPercentage;

  return {
    percentage,
    isEligible,
  };
}

/**
 * Stateful playback tracker simulating client-side video tracking
 * with wall-clock time traversal, jitter buffers, and anti-seek logic.
 */
class TraversalPlaybackTracker {
  constructor(initialDuration = 300, existingRanges = []) {
    this.duration = Math.max(1, Number(initialDuration) || 1);
    this.watchedSet = rangesToSet(existingRanges);
    this.lastPos = -1;
    this.lastWallTime = -1;
    this.playbackRate = 1;
  }

  setDuration(duration) {
    if (Number(duration) > 0) {
      this.duration = Number(duration);
    }
  }

  setPlaybackRate(rate) {
    if (Number(rate) > 0) {
      this.playbackRate = Number(rate);
    }
  }

  sample(currentPos, wallTimeMs) {
    if (typeof currentPos !== 'number' || isNaN(currentPos) || currentPos < 0) return;

    if (this.lastWallTime > 0 && this.lastPos >= 0) {
      const wallElapsedSec = (wallTimeMs - this.lastWallTime) / 1000;
      const mediaDelta = currentPos - this.lastPos;
      const rate = this.playbackRate || 1;

      // Jitter buffer accommodates normal JS event-loop delay, tab backgrounding, and decoder buffering
      const maxAllowedDelta = Math.max(3.5, wallElapsedSec * rate * 1.5 + 1.5);

      if (mediaDelta >= 0 && mediaDelta <= maxAllowedDelta) {
        // Continuous verified playback
        const startSec = Math.floor(this.lastPos);
        const endSec = Math.floor(currentPos);
        for (let s = startSec; s <= endSec; s++) {
          this.watchedSet.add(s);
        }
      } else {
        // Seeking: credit only current landing second
        this.watchedSet.add(Math.floor(currentPos));
      }
    } else {
      this.watchedSet.add(Math.floor(currentPos));
    }

    this.lastPos = currentPos;
    this.lastWallTime = wallTimeMs;
  }

  getWatchedSeconds() {
    return Math.min(this.duration, this.watchedSet.size);
  }

  getRanges() {
    return setToRanges(this.watchedSet);
  }

  getProgress(isCompleted = false) {
    return calculateWatchProgress(this.getWatchedSeconds(), this.duration, isCompleted);
  }
}

module.exports = {
  setToRanges,
  rangesToSet,
  mergeRanges,
  countUniqueSeconds,
  calculateWatchProgress,
  TraversalPlaybackTracker,
};
