/**
 * Web Audio Procedural Synthesizer for Tonny Luns Run
 * Zero external audio file dependencies, 100% reliable offline retro chiptune sounds.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private currentBgm: string | null = null;
  private bgmInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm();
    } else {
      if (this.currentBgm) {
        this.playBgm(this.currentBgm as 'sky' | 'noir_chase' | 'boss');
      }
    }
    return this.isMuted;
  }

  public playTone(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.15) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable or error
    }
  }

  // Sound Effects
  public playJump() {
    if (this.isMuted) return;
    this.playTone(280, 0.12, 'square', 0.12);
    setTimeout(() => this.playTone(420, 0.12, 'triangle', 0.1), 30);
  }

  public playDoubleJump() {
    if (this.isMuted) return;
    this.playTone(520, 0.08, 'triangle', 0.15);
    setTimeout(() => this.playTone(740, 0.14, 'square', 0.12), 40);
  }

  public playDash() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // White noise burst for dash whoosh
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      whiteNoise.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    } catch {
      this.playTone(400, 0.1, 'sawtooth', 0.1);
    }
  }

  public playShoot(weapon: string) {
    if (this.isMuted) return;
    switch (weapon) {
      case 'bubble':
        this.playTone(660, 0.08, 'sine', 0.18);
        setTimeout(() => this.playTone(880, 0.09, 'sine', 0.15), 30);
        break;
      case 'foam':
        this.playTone(320, 0.1, 'triangle', 0.14);
        setTimeout(() => this.playTone(280, 0.1, 'sine', 0.12), 40);
        break;
      case 'star':
        this.playTone(980, 0.06, 'triangle', 0.15);
        setTimeout(() => this.playTone(1320, 0.08, 'square', 0.12), 30);
        break;
      case 'wind':
        this.playTone(240, 0.2, 'sawtooth', 0.14);
        break;
      default:
        this.playTone(500, 0.08, 'square', 0.12);
        break;
    }
  }

  public playCoin() {
    if (this.isMuted) return;
    this.playTone(987.77, 0.08, 'square', 0.1);
    setTimeout(() => this.playTone(1318.51, 0.2, 'square', 0.12), 60);
  }

  public playSecret() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.18, 'triangle', 0.2), idx * 80);
    });
  }

  public playHurt() {
    if (this.isMuted) return;
    this.playTone(160, 0.25, 'sawtooth', 0.25);
    setTimeout(() => this.playTone(110, 0.3, 'sawtooth', 0.2), 60);
  }

  public playEnemyDefeat() {
    if (this.isMuted) return;
    this.playTone(320, 0.1, 'square', 0.12);
    setTimeout(() => this.playTone(180, 0.15, 'sawtooth', 0.15), 40);
  }

  public playBossTelegraph() {
    if (this.isMuted) return;
    this.playTone(130, 0.4, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(195, 0.3, 'sawtooth', 0.2), 150);
  }

  public playVictory() {
    if (this.isMuted) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.25, 'triangle', 0.22), idx * 110);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    const notes = [440, 415.3, 392, 349.23];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.35, 'sawtooth', 0.2), idx * 140);
    });
  }

  public playVehicleMount() {
    if (this.isMuted) return;
    this.playTone(220, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(330, 0.15, 'square', 0.18), 70);
  }

  // Background Music loops
  public playBgm(type: 'sky' | 'noir_chase' | 'boss' | 'menu') {
    this.stopBgm();
    this.currentBgm = type;
    if (this.isMuted) return;

    let step = 0;
    // Retro note definitions
    const skyScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    const noirScale = [164.81, 174.61, 196.0, 220.0, 246.94, 261.63];
    const bossScale = [110.0, 130.81, 146.83, 164.81, 220.0, 261.63];

    const tempo = type === 'boss' ? 180 : type === 'noir_chase' ? 220 : 250;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted) return;
      try {
        let note = 0;
        let typeOsc: OscillatorType = 'triangle';
        let vol = 0.04;

        if (type === 'sky') {
          // Cheerful airy sky progression
          const pattern = [0, 2, 4, 2, 3, 5, 4, 2, 1, 3, 5, 3, 2, 4, 5, 3];
          note = skyScale[pattern[step % pattern.length]];
          typeOsc = step % 4 === 0 ? 'square' : 'triangle';
          vol = 0.05;
        } else if (type === 'noir_chase') {
          // Driving 1980 mystery noir bassline
          const pattern = [0, 0, 3, 0, 1, 1, 4, 1, 2, 2, 5, 2, 3, 2, 1, 0];
          note = noirScale[pattern[step % pattern.length]];
          typeOsc = 'sawtooth';
          vol = 0.06;
        } else if (type === 'boss') {
          // Heavy epic fight pulse
          const pattern = [0, 0, 3, 2, 0, 4, 3, 1, 0, 5, 4, 2, 1, 0, 2, 4];
          note = bossScale[pattern[step % pattern.length]];
          typeOsc = 'square';
          vol = 0.07;
        } else {
          // Menu
          const pattern = [0, 2, 4, 5, 4, 2];
          note = skyScale[pattern[step % pattern.length]];
          typeOsc = 'sine';
          vol = 0.04;
        }

        this.playTone(note, (tempo / 1000) * 0.9, typeOsc, vol);
        step++;
      } catch {
        // Safe fail
      }
    }, tempo);
  }

  public stopBgm() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new SoundSystem();
