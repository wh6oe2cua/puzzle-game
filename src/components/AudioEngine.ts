/**
 * Programmatic Web Audio Engine for immersive mechanical sounds.
 * Generates beautiful bell chimes, click ticks, errors, and success jingles.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a simple crisp mechanical click
  public playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Resonating Alchemical Bell
  public playBell(frequency: number, duration: number = 1.2) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // High-register bell sound with FM/overtones
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      // Main tone
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Overtone (metallic bell character)
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(frequency * 1.5, now);
      gain2.gain.setValueAtTime(0.12, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      this.playTick(); // subtle impact transient
      osc2.start(now);

      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Double mechanical unlocking slide sound
  public playUnlock() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Click followed by a sweeping chime
      this.playTick();
      
      setTimeout(() => {
        if (!this.ctx) return;
        const o1 = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        o1.type = 'sine';
        o1.frequency.setValueAtTime(440, this.ctx.currentTime);
        o1.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3);

        o2.type = 'sine';
        o2.frequency.setValueAtTime(554.37, this.ctx.currentTime); // C#
        o2.frequency.exponentialRampToValueAtTime(1108.73, this.ctx.currentTime + 0.3);

        g.gain.setValueAtTime(0.15, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        o1.connect(g);
        o2.connect(g);
        g.connect(this.ctx.destination);

        o1.start();
        o2.start();
        o1.stop(this.ctx.currentTime + 0.45);
        o2.stop(this.ctx.currentTime + 0.45);
      }, 120);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Failed / Error buzz
  public playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Beautiful ethereal completion jingle
  public playSuccessFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBell(freq, 1.5);
        }, idx * 100);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }
}

export const audio = new AudioEngine();
