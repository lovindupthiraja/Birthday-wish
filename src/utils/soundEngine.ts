/**
 * Lightweight Web Audio API sound effects & slow, calm dreamy Happy Birthday lullaby loop.
 * Zero external audio dependencies — works 100% offline/hermetically.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private bgmPlaying = false;
  private bgmTimer: number | null = null;
  private bgmGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private noteIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(
        this.muted ? 0 : 0.036,
        this.ctx.currentTime,
        0.15
      );
    }
    return this.muted;
  }

  public unlockAudio() {
    this.ensureContext();
    if (!this.bgmPlaying) {
      this.startJazzBGM();
    }
  }

  /**
   * Soft pastel water-drop pop for UI taps
   */
  public playTap(pitchOffset = 0) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const base = 540 + pitchOffset * 28;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.38, now + 0.065);

    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Gentle soft double tone
   */
  public playError() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    [0, 0.14].forEach((offset, i) => {
      const now = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 280 : 220, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.11);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    });
  }

  /**
   * Sparkling ascending chime for celebrations
   */
  public playSuccess() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.44);
    });
  }

  /**
   * Airy transition chime when switching to the next stage
   */
  public playTransition() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [659.25, 880];
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  /**
   * Silky ribbon untying swoosh + delicate harp pluck
   */
  public playRibbonUntie() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.4);
    filter.Q.value = 1.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    [783.99, 987.77, 1174.66].forEach((freq, idx) => {
      const t = now + 0.18 + idx * 0.1;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  /**
   * Soft puff + chime when blowing out a candle
   */
  public playCandleBlow() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.24;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now + 0.04);
    og.gain.setValueAtTime(0.045, now + 0.04);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(og);
    og.connect(ctx.destination);
    osc.start(now + 0.04);
    osc.stop(now + 0.3);
  }

  /**
   * Retro digicam shutter click
   */
  public playShutter() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Joyful confetti pop
   */
  public playConfetti() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((f, i) => {
      const now = ctx.currentTime + i * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    });
  }

  /**
   * Midnight Pastel Bossa-Nova Jazz loop (Fm9 - Bb13 - Ebmaj9 - Cm9 - Abmaj7 - G7b13)
   * with syncopated Rhodes comping, walking acoustic bass, mellow lead, and brushed shimmer.
   */
  public startJazzBGM() {
    if (this.bgmPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.bgmPlaying = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 980;
    filter.Q.value = 0.6;

    const masterGain = ctx.createGain();
    masterGain.gain.value = this.muted ? 0 : 0.038;

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    this.bgmFilter = filter;
    this.bgmGain = masterGain;

    // Pre-generate subtle brushed cymbal buffer for soft bossa whisper
    const brushBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    const bData = brushBuf.getChannelData(0);
    for (let i = 0; i < bData.length; i++) {
      bData[i] = (Math.random() * 2 - 1) * (1 - i / bData.length);
    }

    // Distinct Bossa-Nova / Midnight Jazz in Eb major
    const steps: {
      d: number;
      bass?: number;
      chord?: number[];
      lead?: number;
      brush?: boolean;
    }[] = [
      // Bar 1: Fm9 (F2 bass, Eb3-G3-Ab3-C4)
      { d: 520, bass: 87.31, chord: [155.56, 196.0, 207.65, 261.63], lead: 392.0, brush: true },
      { d: 340, lead: 466.16 },
      { d: 460, chord: [155.56, 196.0, 207.65, 261.63], lead: 523.25, brush: true },
      { d: 480, bass: 130.81, lead: 466.16 },

      // Bar 2: Bb13 -> Bb7b9 (Bb2 bass, Ab3-D4-G4)
      { d: 520, bass: 116.54, chord: [207.65, 293.66, 392.0], lead: 415.3, brush: true },
      { d: 340, lead: 392.0 },
      { d: 480, chord: [207.65, 277.18, 349.23], lead: 349.23, brush: true },
      { d: 460, bass: 146.83, lead: 392.0 },

      // Bar 3: Ebmaj9 (Eb2 bass, G3-Bb3-D4-F4)
      { d: 540, bass: 77.78, chord: [196.0, 233.08, 293.66, 349.23], lead: 466.16, brush: true },
      { d: 360, lead: 523.25 },
      { d: 500, chord: [196.0, 233.08, 293.66, 349.23], lead: 587.33, brush: true },
      { d: 460, bass: 116.54, lead: 523.25 },

      // Bar 4: Cm9 (C3 bass, Bb3-D4-Eb4-G4)
      { d: 520, bass: 130.81, chord: [233.08, 293.66, 311.13, 392.0], lead: 466.16, brush: true },
      { d: 340, lead: 392.0 },
      { d: 480, chord: [233.08, 293.66, 311.13, 392.0], lead: 349.23, brush: true },
      { d: 460, bass: 98.0, lead: 311.13 },

      // Bar 5: Abmaj7 (Ab2 bass, G3-C4-Eb4)
      { d: 520, bass: 103.83, chord: [196.0, 261.63, 311.13], lead: 392.0, brush: true },
      { d: 360, lead: 415.3 },
      { d: 480, chord: [196.0, 261.63, 311.13], lead: 466.16, brush: true },
      { d: 460, bass: 155.56, lead: 523.25 },

      // Bar 6: G7b13 -> C9sus turnaround (G2 bass, F3-B3-Eb4)
      { d: 540, bass: 98.0, chord: [174.61, 246.94, 311.13], lead: 493.88, brush: true },
      { d: 380, lead: 466.16 },
      { d: 640, bass: 130.81, chord: [207.65, 261.63, 293.66, 392.0], lead: 392.0, brush: true },
      { d: 680, bass: 116.54, lead: 349.23 },
    ];

    const playVoice = (freq: number, offset: number, dur: number, peak: number) => {
      if (!this.ctx || !this.bgmFilter) return;
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0006, t + dur);

      osc.connect(gain);
      gain.connect(this.bgmFilter);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };

    const scheduleNext = () => {
      if (!this.bgmPlaying || !this.ctx || !this.bgmFilter) return;
      const step = steps[this.noteIndex % steps.length];
      this.noteIndex++;

      if (!this.muted && this.ctx.state === 'running') {
        const now = this.ctx.currentTime;

        if (step.bass) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(step.bass, now);
          bassGain.gain.setValueAtTime(0.0001, now);
          bassGain.gain.linearRampToValueAtTime(0.42, now + 0.04);
          bassGain.gain.exponentialRampToValueAtTime(0.0008, now + 1.1);
          bassOsc.connect(bassGain);
          bassGain.connect(this.bgmFilter);
          bassOsc.start(now);
          bassOsc.stop(now + 1.15);
        }

        if (step.chord) {
          step.chord.forEach((f, idx) => {
            playVoice(f, idx * 0.03, 1.55, 0.21);
          });
        }

        if (step.lead) {
          playVoice(step.lead, 0.015, 1.05, 0.31);
        }

        if (step.brush && this.bgmGain) {
          const src = this.ctx.createBufferSource();
          src.buffer = brushBuf;
          const hp = this.ctx.createBiquadFilter();
          hp.type = 'bandpass';
          hp.frequency.value = 3400;
          hp.Q.value = 1.4;
          const bg = this.ctx.createGain();
          bg.gain.setValueAtTime(0.045, now);
          bg.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
          src.connect(hp);
          hp.connect(bg);
          bg.connect(this.bgmGain);
          src.start(now);
        }
      }

      this.bgmTimer = window.setTimeout(scheduleNext, step.d);
    };

    scheduleNext();
  }
}

export const soundEngine = new SoundEngine();
