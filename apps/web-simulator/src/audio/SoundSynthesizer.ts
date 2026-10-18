/**
 * Procedural WebAudio Sound Synthesizer for 2026 Tesla Roadster Flight Variant
 * Zero external audio assets needed — synthesizes realistic cold-gas thruster roar,
 * 20 kW underbody suction turbine whine, and electric motor powertrain hum in real-time.
 */
export class SoundSynthesizer {
  private static instance: SoundSynthesizer | null = null;

  private ctx: AudioContext | null = null;
  public enabled: boolean = false;
  public volume: number = 0.5;

  // Master Gain Node
  private masterGain: GainNode | null = null;

  // 1. Cold-Gas Rocket Thruster Sound Nodes
  private thrusterNoiseNode: AudioBufferSourceNode | null = null;
  private thrusterFilter: BiquadFilterNode | null = null;
  private thrusterGain: GainNode | null = null;

  // 2. Underbody Lizard Suction Fan Turbine Nodes
  private fanOsc: OscillatorNode | null = null;
  private fanNoiseNode: AudioBufferSourceNode | null = null;
  private fanFilter: BiquadFilterNode | null = null;
  private fanGain: GainNode | null = null;

  // 3. Dual-Plaid Electric Motor Powertrain Hum Nodes
  private motorOsc: OscillatorNode | null = null;
  private motorSubOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): SoundSynthesizer {
    if (!SoundSynthesizer.instance) {
      SoundSynthesizer.instance = new SoundSynthesizer();
    }
    return SoundSynthesizer.instance;
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupThrusterAudio();
      this.setupSuctionFanAudio();
      this.setupMotorAudio();
      this.isRunning = true;
    } catch (err) {
      console.warn('WebAudio failed to initialize:', err);
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      if (!this.ctx) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
    }
    return this.enabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && this.enabled) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  private createWhiteNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds looped
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private setupThrusterAudio(): void {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createWhiteNoiseBuffer();
    if (!noiseBuffer) return;

    this.thrusterNoiseNode = this.ctx.createBufferSource();
    this.thrusterNoiseNode.buffer = noiseBuffer;
    this.thrusterNoiseNode.loop = true;

    this.thrusterFilter = this.ctx.createBiquadFilter();
    this.thrusterFilter.type = 'lowpass';
    this.thrusterFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.thrusterGain = this.ctx.createGain();
    this.thrusterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.thrusterNoiseNode.connect(this.thrusterFilter);
    this.thrusterFilter.connect(this.thrusterGain);
    this.thrusterGain.connect(this.masterGain);

    this.thrusterNoiseNode.start();
  }

  private setupSuctionFanAudio(): void {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createWhiteNoiseBuffer();
    if (!noiseBuffer) return;

    this.fanNoiseNode = this.ctx.createBufferSource();
    this.fanNoiseNode.buffer = noiseBuffer;
    this.fanNoiseNode.loop = true;

    this.fanFilter = this.ctx.createBiquadFilter();
    this.fanFilter.type = 'bandpass';
    this.fanFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.fanFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.fanGain = this.ctx.createGain();
    this.fanGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.fanOsc = this.ctx.createOscillator();
    this.fanOsc.type = 'sine';
    this.fanOsc.frequency.setValueAtTime(620, this.ctx.currentTime);

    const fanOscGain = this.ctx.createGain();
    fanOscGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    this.fanNoiseNode.connect(this.fanFilter);
    this.fanFilter.connect(this.fanGain);

    this.fanOsc.connect(fanOscGain);
    fanOscGain.connect(this.fanGain);

    this.fanGain.connect(this.masterGain);

    this.fanNoiseNode.start();
    this.fanOsc.start();
  }

  private setupMotorAudio(): void {
    if (!this.ctx || !this.masterGain) return;

    this.motorOsc = this.ctx.createOscillator();
    this.motorOsc.type = 'sawtooth';
    this.motorOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

    this.motorSubOsc = this.ctx.createOscillator();
    this.motorSubOsc.type = 'sine';
    this.motorSubOsc.frequency.setValueAtTime(30, this.ctx.currentTime);

    const motorFilter = this.ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(380, this.ctx.currentTime);

    this.motorGain = this.ctx.createGain();
    this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.motorOsc.connect(motorFilter);
    this.motorSubOsc.connect(motorFilter);
    motorFilter.connect(this.motorGain);
    this.motorGain.connect(this.masterGain);

    this.motorOsc.start();
    this.motorSubOsc.start();
  }

  /**
   * Update synth nodes dynamically based on vehicle simulation frame
   */
  public update(totalThrustKn: number, fanPowerPercent: number, speedKmh: number, throttle: number): void {
    if (!this.enabled || !this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;

    // 1. Thruster cold-gas roar
    if (this.thrusterGain && this.thrusterFilter) {
      const thrustRatio = Math.min(1.0, totalThrustKn / 78.4);
      const targetGain = thrustRatio > 0.02 ? Math.min(0.8, 0.15 + thrustRatio * 0.65) : 0;
      this.thrusterGain.gain.setTargetAtTime(targetGain, now, 0.04);
      const cutoff = 400 + thrustRatio * 1800;
      this.thrusterFilter.frequency.setTargetAtTime(cutoff, now, 0.05);
    }

    // 2. Underbody Lizard Suction Fan Turbine Whine
    if (this.fanGain && this.fanOsc && this.fanFilter) {
      const fanRatio = Math.min(1.0, fanPowerPercent / 100.0);
      const targetGain = fanRatio > 0.1 ? fanRatio * 0.28 : 0;
      this.fanGain.gain.setTargetAtTime(targetGain, now, 0.05);
      const pitch = 400 + fanRatio * 950;
      this.fanOsc.frequency.setTargetAtTime(pitch, now, 0.05);
      this.fanFilter.frequency.setTargetAtTime(pitch * 1.4, now, 0.05);
    }

    // 3. Electric motor powertrain hum
    if (this.motorGain && this.motorOsc && this.motorSubOsc) {
      const speedRatio = Math.min(1.0, speedKmh / 280.0);
      const targetGain = Math.min(0.35, (speedRatio * 0.22) + (throttle * 0.12));
      this.motorGain.gain.setTargetAtTime(targetGain, now, 0.05);
      const motorFreq = 45 + speedRatio * 420;
      this.motorOsc.frequency.setTargetAtTime(motorFreq, now, 0.05);
      this.motorSubOsc.frequency.setTargetAtTime(motorFreq * 0.5, now, 0.05);
    }
  }
}
