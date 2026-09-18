/**
 * Synthetic Royal Enfield Single-Cylinder Engine Sound Engine
 * Uses Web Audio API to reproduce the iconic 4-stroke "Dug-Dug" thump
 */

class RoyalEnfieldSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.rpm = 750; // classic idle RPM
    this.isRevving = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Generate a single 4-stroke thump (compression stroke + exhaust burst)
  playThump(isRev = false) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // 1. Heavy Low-End Punch (The pure bass "Dug")
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const baseFreq = isRev ? 72 : 54;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(18, now + 0.16);

    gain.gain.setValueAtTime(isRev ? 0.9 : 0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.19);

    // 2. Metallic Exhaust Crack / Chamber Pop
    const bufferSize = this.audioCtx.sampleRate * 0.05;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = isRev ? 420 : 280;
    noiseFilter.Q.value = 3.5;

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(isRev ? 0.35 : 0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioCtx.destination);
    noise.start(now);
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Single cylinder 4-stroke fires once every 2 crankshaft revolutions
    // At 750 RPM -> 12.5 rev/sec -> ~6.25 thumps/sec -> interval ~160ms
    const scheduleNext = () => {
      if (!this.isPlaying) return;
      this.playThump(this.isRevving);
      const delay = this.isRevving ? 85 : 155;
      this.intervalId = setTimeout(scheduleNext, delay);
    };

    scheduleNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  rev(durationMs = 1500) {
    if (!this.isPlaying) {
      this.start();
    }
    this.isRevving = true;
    setTimeout(() => {
      this.isRevving = false;
    }, durationMs);
  }
}

window.reSoundEngine = new RoyalEnfieldSoundEngine();
