import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  private tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gainPeak = 0.18) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  }

  /** Cheerful two-note rising chime for a correct answer. */
  playCorrect() {
    try {
      this.tone(587.33, 0, 0.15, 'sine');    // D5
      this.tone(880.0, 0.12, 0.22, 'sine');  // A5
    } catch { /* audio unavailable, ignore */ }
  }

  /** Low buzz for an incorrect answer. */
  playIncorrect() {
    try {
      this.tone(180, 0, 0.18, 'sawtooth', 0.12);
      this.tone(140, 0.1, 0.22, 'sawtooth', 0.12);
    } catch { /* audio unavailable, ignore */ }
  }

  /** Bright fanfare for finishing a unit. */
  playComplete() {
    try {
      this.tone(523.25, 0, 0.14, 'triangle');
      this.tone(659.25, 0.12, 0.14, 'triangle');
      this.tone(783.99, 0.24, 0.3, 'triangle');
    } catch { /* ignore */ }
  }

  /** Soft tactile pop when a word/option is tapped. */
  playClick() {
    try {
      this.tone(720, 0, 0.06, 'sine', 0.1);
    } catch { /* ignore */ }
  }

  /** Speaks a word aloud using the browser's built-in text-to-speech, if available. */
  speak(text: string, langCode: string) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.rate = 0.9;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    } catch { /* speech synthesis unavailable, ignore */ }
  }
}
