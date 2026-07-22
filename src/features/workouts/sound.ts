// Tiny WebAudio beeper for the workout countdown. Works on iOS Safari (where
// the Vibration API does not), as long as the AudioContext is first created /
// resumed from a user gesture — call unlockSound() from a tap handler.

type Ctx = AudioContext;
let ctx: Ctx | null = null;

function getCtx(): Ctx | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Prime the audio context from a user gesture so later beeps are allowed. */
export function unlockSound(): void {
  getCtx();
}

/** Short beep. Higher, longer tones read as "go / done". */
export function beep(frequency = 880, durationMs = 120): void {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(c.destination);
    const t = c.currentTime;
    const dur = durationMs / 1000;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  } catch {
    /* ignore */
  }
}

export const tickBeep = () => beep(760, 110);
export const goBeep = () => beep(1180, 220);
