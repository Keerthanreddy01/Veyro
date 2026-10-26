/**
 * Proctoring & Examination Integrity Monitor
 * Client-side camera management, face detection, tab visibility tracking,
 * and debounced integrity event dispatching.
 *
 * Privacy & Security design:
 * - NO video frames or raw camera streams are saved or uploaded to the server.
 * - Processing is purely local and real-time.
 * - Only timestamped event metadata is recorded for instructor audit.
 */

export interface IntegrityEventPayload {
  eventType:
    | 'tab_hidden'
    | 'tab_blur'
    | 'face_absent'
    | 'prolonged_absence'
    | 'multiple_faces'
    | 'camera_interrupted'
    | 'camera_restored'
    | 'network_disconnect'
    | 'network_reconnect'
    | 'session_resumed';
  severity: 'info' | 'warning' | 'critical';
  description: string;
}

export interface ProctoringCallbacks {
  onEvent: (event: IntegrityEventPayload) => void;
  onFaceStatusChange?: (status: { present: boolean; multiple: boolean; error?: string }) => void;
}

export class ProctoringMonitor {
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private faceDetector: any = null;
  private absentSeconds = 0;
  private facePresent = true;
  private callbacks: ProctoringCallbacks;
  private isDestroyed = false;
  private lastReportedEvent: { type: string; time: number } = { type: '', time: 0 };

  constructor(callbacks: ProctoringCallbacks) {
    this.callbacks = callbacks;
    // Check for native Shape Detection API (available in modern Chromium/Edge)
    if (typeof window !== 'undefined' && (window as any).FaceDetector) {
      try {
        this.faceDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
      } catch {
        this.faceDetector = null;
      }
    }
  }

  /**
   * Request camera access with granular error classification
   */
  public async requestCamera(): Promise<{ success: boolean; stream?: MediaStream; error?: string }> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          error: 'Camera access is not supported by your browser. Please use Chrome, Edge, or Firefox.',
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.stream = stream;

      // Monitor stream lifecycle (e.g. user unplugs camera or revokes permission)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          if (!this.isDestroyed) {
            this.callbacks.onEvent({
              eventType: 'camera_interrupted',
              severity: 'critical',
              description: 'Camera video track ended or hardware disconnected.',
            });
            this.callbacks.onFaceStatusChange?.({ present: false, multiple: false, error: 'Camera disconnected' });
          }
        });
      }

      return { success: true, stream };
    } catch (err: any) {
      let friendlyMessage = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMessage = 'Camera permission was denied. Please allow camera permissions in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMessage = 'No camera device was detected on your system. Please connect a working webcam.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyMessage = 'Your camera is currently in use by another application (e.g. Zoom or Teams). Please close other apps and retry.';
      }

      return { success: false, error: friendlyMessage };
    }
  }

  /**
   * Attach camera video element for real-time local inspection
   */
  public attachVideo(videoElement: HTMLVideoElement) {
    this.videoEl = videoElement;
    if (this.stream) {
      this.videoEl.srcObject = this.stream;
      this.videoEl.play().catch(() => {});
    }

    if (!this.canvasEl) {
      this.canvasEl = document.createElement('canvas');
      this.canvasEl.width = 160;
      this.canvasEl.height = 120;
    }
  }

  /**
   * Start local periodic detection loops (every 1.5 seconds)
   */
  public startDetection() {
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkInterval = setInterval(() => {
      this.performFaceCheck();
    }, 1500);
  }

  /**
   * Perform privacy-preserving local face analysis
   */
  private async performFaceCheck() {
    if (this.isDestroyed || !this.videoEl || !this.stream) return;

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.enabled || videoTrack.readyState !== 'live') {
      this.dispatchDebouncedEvent({
        eventType: 'camera_interrupted',
        severity: 'critical',
        description: 'Camera stream interrupted or paused.',
      });
      this.callbacks.onFaceStatusChange?.({ present: false, multiple: false, error: 'Stream paused' });
      return;
    }

    try {
      if (this.faceDetector && this.videoEl.readyState >= 2) {
        // Native browser FaceDetector API
        const faces = await this.faceDetector.detect(this.videoEl);
        if (faces.length === 0) {
          this.handleFaceAbsent();
        } else if (faces.length > 1) {
          this.handleMultipleFaces(faces.length);
        } else {
          this.handleFacePresent();
        }
      } else {
        // Fallback lightweight optical skin/luminosity detection via canvas
        this.fallbackCanvasDetection();
      }
    } catch {
      // If detection fails momentarily, don't crash
    }
  }

  /**
   * Lightweight fallback for browsers without native FaceDetector
   * Analyzes brightness and center pixel distribution on downsampled 160x120 canvas
   */
  private fallbackCanvasDetection() {
    if (!this.videoEl || !this.canvasEl || this.videoEl.readyState < 2) return;

    const ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(this.videoEl, 0, 0, 160, 120);
    const frame = ctx.getImageData(0, 0, 160, 120);
    const data = frame.data;

    let totalBrightness = 0;
    let skinToneMatches = 0;
    const len = data.length;

    for (let i = 0; i < len; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;

      // Rule-based human skin-tone color space approximation (RGB standard)
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && r - g > 10) {
        skinToneMatches++;
      }
    }

    const avgBrightness = totalBrightness / (len / 16);
    const hasEnoughLight = avgBrightness > 20 && avgBrightness < 250;
    const hasFaceLikePixels = skinToneMatches > 25;

    if (!hasEnoughLight || !hasFaceLikePixels) {
      this.handleFaceAbsent();
    } else {
      this.handleFacePresent();
    }
  }

  private handleFaceAbsent() {
    this.absentSeconds += 1.5;
    this.facePresent = false;
    this.callbacks.onFaceStatusChange?.({ present: false, multiple: false });

    // Warning after 3 seconds of absence
    if (this.absentSeconds >= 3 && this.absentSeconds < 10) {
      this.dispatchDebouncedEvent({
        eventType: 'face_absent',
        severity: 'warning',
        description: 'Candidate face is not detected in camera frame.',
      });
    }

    // Critical escalation after 10+ seconds of prolonged absence
    if (this.absentSeconds >= 10) {
      this.dispatchDebouncedEvent({
        eventType: 'prolonged_absence',
        severity: 'critical',
        description: `Prolonged absence detected: face missing for over ${Math.round(this.absentSeconds)} seconds.`,
      });
    }
  }

  private handleMultipleFaces(count: number) {
    this.absentSeconds = 0;
    this.facePresent = true;
    this.callbacks.onFaceStatusChange?.({ present: true, multiple: true });

    this.dispatchDebouncedEvent({
      eventType: 'multiple_faces',
      severity: 'warning',
      description: `Multiple faces detected in camera viewport (${count} visible faces).`,
    });
  }

  private handleFacePresent() {
    if (!this.facePresent && this.absentSeconds >= 3) {
      // Dispatches camera restored if previously absent
      this.callbacks.onEvent({
        eventType: 'camera_restored',
        severity: 'info',
        description: 'Candidate returned to camera frame; face presence restored.',
      });
    }

    this.absentSeconds = 0;
    this.facePresent = true;
    this.callbacks.onFaceStatusChange?.({ present: true, multiple: false });
  }

  /**
   * Debounce events so identical alerts aren't spammed faster than every 4 seconds
   */
  private dispatchDebouncedEvent(event: IntegrityEventPayload) {
    const now = Date.now();
    if (this.lastReportedEvent.type === event.eventType && now - this.lastReportedEvent.time < 4000) {
      return;
    }
    this.lastReportedEvent = { type: event.eventType, time: now };
    this.callbacks.onEvent(event);
  }

  /**
   * Clean up all tracks, stop intervals, and release camera hardware
   */
  public stop() {
    this.isDestroyed = true;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }

    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
  }
}
