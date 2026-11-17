/**
 * Acoustic & Stadium Tribute Audio Engine
 * Amplifies the curated soundtrack (`/assets/audio/bg-music.mp3`) through a Web Audio
 * broadcast limiter and pairs it with physically modeled acoustic fipple/pea whistles,
 * open-air Chepauk stadium echo, full-spectrum crowd roar, and willow bat strike SFX.
 */
class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private sfxBus: GainNode | null = null;
  private stadiumEchoBus: GainNode | null = null;
  private whistleSaturatorCurve: Float32Array<ArrayBuffer> | null = null;
  private bgm: HTMLAudioElement | null = null;
  private bgmSource: MediaElementAudioSourceNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmPauseTimer = 0;
  private crowdGain: GainNode | null = null;
  private crowdFilter: BiquadFilterNode | null = null;
  private crowdSubOsc: OscillatorNode | null = null;
  private crowdSubGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private bgmTargetGain = 1.65;
  private isPlaying = false;
  private isInitialized = false;

  public get active(): boolean {
    return this.isPlaying;
  }

  public preload(): void {
    this.ensureBgm();
  }

  private ensureBgm(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    if (!this.bgm) {
      const audio = new Audio('/assets/audio/bg-music.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 1;
      this.bgm = audio;
    }
    return this.bgm;
  }

  private createSoftSaturationCurve(): Float32Array<ArrayBuffer> {
    const samples = 256;
    const buffer = new ArrayBuffer(samples * Float32Array.BYTES_PER_ELEMENT);
    const curve = new Float32Array(buffer);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Gentle asymmetric tube saturation modeling fipple air-jet compression
      curve[i] = Math.tanh(x * 1.45 + 0.08 * x * x);
    }
    return curve;
  }

  private initWebAudio(): void {
    if (this.isInitialized) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.whistleSaturatorCurve = this.createSoftSaturationCurve();

    // Soft-knee broadcast limiter for clean headroom across loud crowd & whistles
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4.5, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);
    this.compressor.connect(this.ctx.destination);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.sfxBus.connect(this.compressor);

    // Open-air Chepauk stadium slapback reflection bus (dual filtered delays)
    this.stadiumEchoBus = this.ctx.createGain();
    this.stadiumEchoBus.gain.setValueAtTime(0.32, this.ctx.currentTime);

    const delayL = this.ctx.createDelay(0.5);
    const delayR = this.ctx.createDelay(0.5);
    delayL.delayTime.setValueAtTime(0.145, this.ctx.currentTime);
    delayR.delayTime.setValueAtTime(0.235, this.ctx.currentTime);

    const echoDampL = this.ctx.createBiquadFilter();
    const echoDampR = this.ctx.createBiquadFilter();
    echoDampL.type = 'lowpass';
    echoDampR.type = 'lowpass';
    echoDampL.frequency.setValueAtTime(2100, this.ctx.currentTime);
    echoDampR.frequency.setValueAtTime(1650, this.ctx.currentTime);

    const fbL = this.ctx.createGain();
    const fbR = this.ctx.createGain();
    fbL.gain.setValueAtTime(0.26, this.ctx.currentTime);
    fbR.gain.setValueAtTime(0.22, this.ctx.currentTime);

    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panL) panL.pan.setValueAtTime(-0.55, this.ctx.currentTime);
    if (panR) panR.pan.setValueAtTime(0.55, this.ctx.currentTime);

    this.stadiumEchoBus.connect(delayL);
    delayL.connect(echoDampL);
    echoDampL.connect(fbL);
    fbL.connect(delayR);

    this.stadiumEchoBus.connect(delayR);
    delayR.connect(echoDampR);
    echoDampR.connect(fbR);
    fbR.connect(delayL);

    if (panL && panR) {
      echoDampL.connect(panL);
      panL.connect(this.sfxBus);
      echoDampR.connect(panR);
      panR.connect(this.sfxBus);
    } else {
      echoDampL.connect(this.sfxBus);
      echoDampR.connect(this.sfxBus);
    }

    // Route HTML5 background music through Web Audio gain node
    const bgm = this.ensureBgm();
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.bgmGain.connect(this.compressor);
    if (bgm && !this.bgmSource) {
      try {
        bgm.volume = 1;
        this.bgmSource = this.ctx.createMediaElementSource(bgm);
        this.bgmSource.connect(this.bgmGain);
      } catch {
        // Ignore if element source is unsupported
      }
    }

    // Stereo stadium noise buffer (pink/white air blend for crowd & whistle breath jet)
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const sample = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.42;
        b6 = white * 0.115926;
        data[i] = Math.max(-0.98, Math.min(0.98, sample));
      }
    }
    this.noiseBuffer = buffer;

    // Multi-band stadium crowd roar bed
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    this.crowdFilter = this.ctx.createBiquadFilter();
    this.crowdFilter.type = 'lowpass';
    this.crowdFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    this.crowdFilter.Q.setValueAtTime(0.75, this.ctx.currentTime);

    const voicePresence = this.ctx.createBiquadFilter();
    voicePresence.type = 'peaking';
    voicePresence.frequency.setValueAtTime(980, this.ctx.currentTime);
    voicePresence.Q.setValueAtTime(0.65, this.ctx.currentTime);
    voicePresence.gain.setValueAtTime(6, this.ctx.currentTime);

    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    noiseSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.crowdGain);

    noiseSource.connect(voicePresence);
    voicePresence.connect(this.crowdFilter);
    this.crowdFilter.connect(this.crowdGain);

    this.crowdGain.connect(this.sfxBus);
    noiseSource.start();

    // Warm chest sub-rumble for charging stadium pressure
    this.crowdSubOsc = this.ctx.createOscillator();
    this.crowdSubOsc.type = 'triangle';
    this.crowdSubOsc.frequency.setValueAtTime(58, this.ctx.currentTime);
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.crowdSubGain = this.ctx.createGain();
    this.crowdSubGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.crowdSubOsc.connect(subFilter);
    subFilter.connect(this.crowdSubGain);
    this.crowdSubGain.connect(this.sfxBus);
    this.crowdSubOsc.start();

    this.isInitialized = true;
  }

  public prepareInteractiveFx(): void {
    this.initWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private duckBgmTemporarily(duckDurationSec = 1.3): void {
    if (!this.isPlaying || !this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setTargetAtTime(this.bgmTargetGain * 0.42, now, 0.05);
    this.bgmGain.gain.setTargetAtTime(this.bgmTargetGain, now + duckDurationSec * 0.45, 0.45);
  }

  /**
   * Physically modeled human-blown stadium pea-whistle:
   * - Turbulent fipple breath jet (air noise puff before pitch lock + exhale tail)
   * - Natural lung pitch-scoop up on attack and air sag on release
   * - Irregular tumbling cork-pea modulation (combined AM gating + jittered FM)
   * - Soft asymmetric air-column saturation + stereo panning into stadium echo
   */
  private triggerRealisticStadiumWhistle(options: {
    startTime: number;
    duration: number;
    freq: number;
    endFreq?: number;
    gainLevel?: number;
    pan?: number;
    withPeaBall?: boolean;
  }): void {
    if (!this.ctx || !this.sfxBus || !this.noiseBuffer) return;

    const {
      startTime,
      duration,
      freq,
      endFreq = freq * 1.04,
      gainLevel = 0.34,
      pan = 0,
      withPeaBall = true,
    } = options;

    const breathLead = 0.018;
    const exhaleTail = 0.055;
    const stopTime = startTime + duration + exhaleTail;

    // Panner output
    const outNode = this.ctx.createGain();
    outNode.gain.setValueAtTime(1, startTime);
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, startTime);
      outNode.connect(panner);
      panner.connect(this.sfxBus);
      if (this.stadiumEchoBus) panner.connect(this.stadiumEchoBus);
    } else {
      outNode.connect(this.sfxBus);
      if (this.stadiumEchoBus) outNode.connect(this.stadiumEchoBus);
    }

    // 1. Air-Column Fundamental + Subtle 2nd Tube Harmonic + Soft Saturation
    const mainOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    const toneEnv = this.ctx.createGain();

    mainOsc.type = 'sine';
    overtoneOsc.type = 'sine';
    overtoneGain.gain.setValueAtTime(0.11, startTime);

    // Human lung pressure contour: crisp pitch scoop UP on attack -> hold -> natural sag on release
    const attackEnd = startTime + Math.min(0.055, duration * 0.25);
    const sagStart = startTime + Math.max(duration * 0.72, duration - 0.06);
    mainOsc.frequency.setValueAtTime(freq * 0.84, startTime);
    mainOsc.frequency.exponentialRampToValueAtTime(freq, attackEnd);
    mainOsc.frequency.linearRampToValueAtTime(endFreq, sagStart);
    mainOsc.frequency.exponentialRampToValueAtTime(endFreq * 0.91, startTime + duration);

    overtoneOsc.frequency.setValueAtTime(freq * 1.98 * 0.84, startTime);
    overtoneOsc.frequency.exponentialRampToValueAtTime(freq * 1.98, attackEnd);
    overtoneOsc.frequency.linearRampToValueAtTime(endFreq * 1.98, sagStart);
    overtoneOsc.frequency.exponentialRampToValueAtTime(endFreq * 1.98 * 0.91, startTime + duration);

    // Chamber bandpass filter + asymmetric air-jet saturator
    const chamberFilter = this.ctx.createBiquadFilter();
    chamberFilter.type = 'bandpass';
    chamberFilter.frequency.setValueAtTime(freq * 1.05, startTime);
    chamberFilter.Q.setValueAtTime(1.6, startTime);

    const shaper = this.ctx.createWaveShaper();
    if (this.whistleSaturatorCurve) {
      shaper.curve = this.whistleSaturatorCurve;
    }

    // AM + FM irregular tumbling cork-pea ball modulation
    const peaGainMod = this.ctx.createGain();
    peaGainMod.gain.setValueAtTime(1, startTime);

    let peaLfo1: OscillatorNode | null = null;
    let peaLfo2: OscillatorNode | null = null;

    if (withPeaBall) {
      peaLfo1 = this.ctx.createOscillator();
      peaLfo2 = this.ctx.createOscillator();
      const fmDepth1 = this.ctx.createGain();
      const fmDepth2 = this.ctx.createGain();
      const amDepth = this.ctx.createGain();

      // Accelerating cork pea swirl (~31Hz -> 43Hz) + secondary irregular beat (21.5Hz)
      peaLfo1.frequency.setValueAtTime(31, startTime);
      peaLfo1.frequency.linearRampToValueAtTime(43, startTime + duration * 0.65);
      peaLfo2.frequency.setValueAtTime(21.5, startTime);

      fmDepth1.gain.setValueAtTime(52, startTime);
      fmDepth2.gain.setValueAtTime(28, startTime);
      amDepth.gain.setValueAtTime(0.24, startTime);

      peaLfo1.connect(fmDepth1);
      peaLfo2.connect(fmDepth2);
      fmDepth1.connect(mainOsc.frequency);
      fmDepth2.connect(mainOsc.frequency);

      // Cork ball momentarily chokes the air slot cleanly (authentic rattle texture)
      peaGainMod.gain.setValueAtTime(0.76, startTime);
      peaLfo1.connect(amDepth);
      amDepth.connect(peaGainMod.gain);
    }

    // Tone amplitude envelope
    toneEnv.gain.setValueAtTime(0.0001, startTime);
    toneEnv.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.022);
    toneEnv.gain.setValueAtTime(gainLevel * 0.94, Math.max(startTime + 0.03, startTime + duration - 0.035));
    toneEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.015);

    mainOsc.connect(shaper);
    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(shaper);
    shaper.connect(chamberFilter);
    chamberFilter.connect(peaGainMod);
    peaGainMod.connect(toneEnv);
    toneEnv.connect(outNode);

    // 2. Breathy Turbulent Fipple Air Jet (resonant breath tone + upper lip hiss)
    const airStart = Math.max(this.ctx.currentTime, startTime - breathLead);
    const breathSrc = this.ctx.createBufferSource();
    breathSrc.buffer = this.noiseBuffer;
    breathSrc.loop = true;

    const tunedAirFilter = this.ctx.createBiquadFilter();
    tunedAirFilter.type = 'bandpass';
    tunedAirFilter.frequency.setValueAtTime(freq, airStart);
    tunedAirFilter.Q.setValueAtTime(5.2, airStart);

    const broadHissFilter = this.ctx.createBiquadFilter();
    broadHissFilter.type = 'bandpass';
    broadHissFilter.frequency.setValueAtTime(4300, airStart);
    broadHissFilter.Q.setValueAtTime(1.1, airStart);

    const breathEnv = this.ctx.createGain();
    breathEnv.gain.setValueAtTime(0.0001, airStart);
    breathEnv.gain.exponentialRampToValueAtTime(gainLevel * 0.72, startTime + 0.012);
    breathEnv.gain.setValueAtTime(gainLevel * 0.52, startTime + duration * 0.85);
    breathEnv.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    const hissEnv = this.ctx.createGain();
    hissEnv.gain.setValueAtTime(0.0001, airStart);
    hissEnv.gain.exponentialRampToValueAtTime(gainLevel * 0.28, startTime + 0.01);
    hissEnv.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    breathSrc.connect(tunedAirFilter);
    tunedAirFilter.connect(breathEnv);
    breathEnv.connect(outNode);

    breathSrc.connect(broadHissFilter);
    broadHissFilter.connect(hissEnv);
    hissEnv.connect(outNode);

    // Start & Schedule Clean Auto-GC Stops
    mainOsc.start(startTime);
    overtoneOsc.start(startTime);
    breathSrc.start(airStart, Math.random() * 1.5);
    peaLfo1?.start(startTime);
    peaLfo2?.start(startTime);

    mainOsc.stop(stopTime);
    overtoneOsc.stop(stopTime);
    breathSrc.stop(stopTime);
    peaLfo1?.stop(stopTime);
    peaLfo2?.stop(stopTime);
  }

  public async toggle(): Promise<boolean> {
    this.initWebAudio();
    const bgm = this.ensureBgm();

    if (this.bgmPauseTimer) {
      window.clearTimeout(this.bgmPauseTimer);
      this.bgmPauseTimer = 0;
    }

    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.ctx && this.bgmGain && this.crowdGain && this.crowdSubGain) {
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(0.0001, now, 0.08);
        this.crowdGain.gain.setTargetAtTime(0.0001, now, 0.08);
        this.crowdSubGain.gain.setTargetAtTime(0.0001, now, 0.08);
      }
      if (bgm) {
        this.bgmPauseTimer = window.setTimeout(() => {
          if (!this.isPlaying) bgm.pause();
        }, 280);
      }
      return false;
    }

    this.isPlaying = true;
    let startedAny = false;

    if (this.ctx) {
      startedAny = true;
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      if (this.bgmGain && this.isPlaying) {
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(this.bgmTargetGain, now, 0.25);
      }
    }

    if (bgm) {
      startedAny = true;
      bgm.play().catch(() => {
        if (!this.ctx) this.isPlaying = false;
      });
    }

    if (!startedAny) {
      this.isPlaying = false;
      return false;
    }

    return this.isPlaying;
  }

  public async enable(): Promise<boolean> {
    if (this.isPlaying) return true;
    return this.toggle();
  }

  public updateAtmosphere(scrollProgress: number): void {
    const isFinalWalk = scrollProgress > 0.79;
    const isCrowdPeak = scrollProgress > 0.24 && scrollProgress < 0.77;
    const nextGain = isFinalWalk ? 1.25 : isCrowdPeak ? 1.8 : 1.6;

    if (Math.abs(nextGain - this.bgmTargetGain) > 0.05) {
      this.bgmTargetGain = nextGain;
      if (this.isPlaying && this.ctx && this.bgmGain) {
        this.bgmGain.gain.setTargetAtTime(nextGain, this.ctx.currentTime, 0.35);
      }
    }
  }

  public playSubtlePulse(pitch = 329.63): void {
    this.prepareInteractiveFx();
    if (!this.isPlaying || !this.ctx || !this.sfxBus) return;

    const now = this.ctx.currentTime;
    const notes = [pitch, pitch * 1.5, pitch * 2];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxBus) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.025);
      gain.gain.setValueAtTime(0.0001, now + i * 0.025);
      gain.gain.exponentialRampToValueAtTime(i === 0 ? 0.22 : 0.12 / i, now + i * 0.025 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(now + i * 0.025);
      osc.stop(now + 1.0);
    });
  }

  public playCricketWhip(): void {
    this.prepareInteractiveFx();
    if (!this.isPlaying || !this.ctx || !this.sfxBus || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.16);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.38);
    filter.Q.setValueAtTime(1.4, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.45, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxBus);
    src.start(now);
    src.stop(now + 0.45);
  }

  public playDholThump(intensity = 0.8): void {
    this.prepareInteractiveFx();
    if (!this.ctx || !this.sfxBus) return;
    const now = this.ctx.currentTime;
    const amp = Math.min(1, Math.max(0.25, intensity));

    const drumOsc = this.ctx.createOscillator();
    const drumGain = this.ctx.createGain();
    drumOsc.type = 'sine';
    drumOsc.frequency.setValueAtTime(155 + amp * 35, now);
    drumOsc.frequency.exponentialRampToValueAtTime(48, now + 0.14);
    drumGain.gain.setValueAtTime(0.62 * amp, now);
    drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    drumOsc.connect(drumGain);
    drumGain.connect(this.sfxBus);
    drumOsc.start(now);
    drumOsc.stop(now + 0.24);

    if (this.noiseBuffer) {
      const snapSrc = this.ctx.createBufferSource();
      snapSrc.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1350, now);
      bp.Q.setValueAtTime(1.2, now);
      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.28 * amp, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      snapSrc.connect(bp);
      bp.connect(snapGain);
      snapGain.connect(this.sfxBus);
      snapSrc.start(now);
      snapSrc.stop(now + 0.07);
    }
  }

  public playBatStrike(): void {
    this.prepareInteractiveFx();
    if (!this.ctx || !this.sfxBus) return;
    const now = this.ctx.currentTime;

    this.duckBgmTemporarily(1.2);
    this.playDholThump(1.0);

    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(640, now);
    crackOsc.frequency.exponentialRampToValueAtTime(110, now + 0.065);
    crackGain.gain.setValueAtTime(0.75, now);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    crackOsc.connect(crackGain);
    crackGain.connect(this.sfxBus);
    crackOsc.start(now);
    crackOsc.stop(now + 0.14);

    if (this.crowdGain && this.crowdFilter) {
      this.crowdFilter.frequency.setTargetAtTime(3600, now + 0.02, 0.12);
      this.crowdGain.gain.setTargetAtTime(0.95, now + 0.02, 0.1);
      this.crowdFilter.frequency.setTargetAtTime(1400, now + 1.4, 0.7);
      this.crowdGain.gain.setTargetAtTime(0.0001, now + 1.4, 0.7);
    }
  }

  public setRoarBoost(intensity: number): void {
    const clamped = Math.min(1, Math.max(0, intensity));
    if (clamped > 0.01) {
      this.prepareInteractiveFx();
    }
    if (!this.ctx || !this.crowdGain || !this.crowdFilter || !this.crowdSubGain || !this.crowdSubOsc) {
      return;
    }

    const now = this.ctx.currentTime;
    if (clamped > 0.015) {
      this.crowdGain.gain.setTargetAtTime(0.34 + clamped * 0.85, now, 0.07);
      this.crowdFilter.frequency.setTargetAtTime(900 + clamped * 3400, now, 0.07);
      this.crowdSubOsc.frequency.setTargetAtTime(56 + clamped * 32, now, 0.08);
      this.crowdSubGain.gain.setTargetAtTime(0.08 + clamped * 0.18, now, 0.08);
    } else {
      this.crowdGain.gain.setTargetAtTime(0.0001, now, 0.12);
      this.crowdSubGain.gain.setTargetAtTime(0.0001, now, 0.1);
    }
  }

  /**
   * Authentic 124.8 dB Chepauk Eruption:
   * Dhol smash + massive stadium roar + multi-stand realistic breath-blown "Whistle Podu!" chorus
   */
  public playWhistlePoduEruption(): void {
    this.prepareInteractiveFx();
    if (!this.ctx || !this.sfxBus) return;
    const now = this.ctx.currentTime;

    this.duckBgmTemporarily(2.2);
    this.playDholThump(1.0);

    // Massive open-air Chepauk stadium crowd wave
    if (this.crowdGain && this.crowdFilter) {
      this.crowdFilter.frequency.setTargetAtTime(4200, now, 0.08);
      this.crowdGain.gain.setTargetAtTime(1.12, now, 0.08);
      this.crowdFilter.frequency.setTargetAtTime(1600, now + 2.4, 0.85);
      this.crowdGain.gain.setTargetAtTime(0.0001, now + 2.4, 0.85);
    }

    // Lead realistic Chepauk pea-whistle cadence ("Short - Short - Soaring Whistle Podu!")
    this.triggerRealisticStadiumWhistle({
      startTime: now + 0.04,
      duration: 0.15,
      freq: 2740,
      endFreq: 2880,
      gainLevel: 0.36,
      pan: 0,
      withPeaBall: true,
    });
    this.triggerRealisticStadiumWhistle({
      startTime: now + 0.25,
      duration: 0.15,
      freq: 2820,
      endFreq: 2960,
      gainLevel: 0.36,
      pan: 0,
      withPeaBall: true,
    });
    this.triggerRealisticStadiumWhistle({
      startTime: now + 0.48,
      duration: 0.62,
      freq: 2680,
      endFreq: 3120,
      gainLevel: 0.42,
      pan: 0,
      withPeaBall: true,
    });

    // Overlapping secondary stand whistles (left & right Chepauk stands joining in!)
    this.triggerRealisticStadiumWhistle({
      startTime: now + 0.18,
      duration: 0.38,
      freq: 3180,
      endFreq: 3320,
      gainLevel: 0.18,
      pan: -0.58,
      withPeaBall: false,
    });
    this.triggerRealisticStadiumWhistle({
      startTime: now + 0.56,
      duration: 0.58,
      freq: 2490,
      endFreq: 2720,
      gainLevel: 0.22,
      pan: 0.55,
      withPeaBall: true,
    });
  }

  /**
   * Realistic quick whistle chirp + Dhol stamp for claiming #07 Pass or signing Fan Wall
   */
  public playStampTribute(): void {
    this.prepareInteractiveFx();
    if (!this.ctx || !this.sfxBus) return;
    const now = this.ctx.currentTime;

    this.playDholThump(0.75);
    this.triggerRealisticStadiumWhistle({
      startTime: now + 0.05,
      duration: 0.22,
      freq: 2640,
      endFreq: 2940,
      gainLevel: 0.28,
      pan: 0,
      withPeaBall: true,
    });
  }
}

export const audioEngine = new CinematicAudioEngine();
