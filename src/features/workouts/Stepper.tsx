interface StepperProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Format the displayed value (e.g. add a unit). */
  format?: (v: number) => string;
}

/** A compact −/+ number stepper with the label stacked above the controls. */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  format,
}: StepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  return (
    <div className="stepper">
      <span className="steplbl">{label}</span>
      <div className="stepctl">
        <button
          type="button"
          className="rnd"
          aria-label={`${label}: mindre`}
          onClick={() => set(+(value - step).toFixed(2))}
          disabled={value <= min}
        >
          −
        </button>
        <span className="stepval">{format ? format(value) : value}</span>
        <button
          type="button"
          className="rnd"
          aria-label={`${label}: mere`}
          onClick={() => set(+(value + step).toFixed(2))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
