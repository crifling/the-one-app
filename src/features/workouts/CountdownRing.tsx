interface CountdownRingProps {
  /** Seconds remaining. */
  remaining: number;
  /** Total seconds this countdown started from (for the progress arc). */
  total: number;
  tone: 'work' | 'rest';
  /** Big centre text (already formatted). */
  display: string;
  /** Small caption under the number (e.g. "GØR KLAR"). */
  caption?: string;
}

const SIZE = 260;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Circular countdown with a depleting progress arc. */
export function CountdownRing({ remaining, total, tone, display, caption }: CountdownRingProps) {
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const offset = C * (1 - frac);
  const urgent = remaining <= 3 && remaining > 0;
  const stroke = urgent ? 'var(--danger)' : tone === 'rest' ? '#c9a24a' : 'var(--accent)';

  return (
    <div className={`ring${urgent ? ' urgent' : ''}`} role="timer" aria-live="off">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--line)"
          strokeWidth={STROKE}
        />
        <circle
          className="ring-progress"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <div className="ring-center">
        <div className="ring-num">{display}</div>
        {caption && <div className="ring-cap">{caption}</div>}
      </div>
    </div>
  );
}
