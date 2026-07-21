import type { ReactNode } from 'react';

interface CheckRowProps {
  checked: boolean;
  onToggle: () => void;
  title: string;
  meta?: ReactNode;
  /** Small tag rendered on the right (e.g. priority). */
  tag?: ReactNode;
  /** Extra trailing control (e.g. a delete button). */
  trailing?: ReactNode;
  label?: string;
}

/** A card-styled checkable row used for tasks, track actions and routine steps. */
export function CheckRow({
  checked,
  onToggle,
  title,
  meta,
  tag,
  trailing,
  label,
}: CheckRowProps) {
  return (
    <div className="card todo">
      <label className="todo grow" style={{ margin: 0 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label={label ?? title}
        />
        <span className="check" aria-hidden="true" />
        <span className="copy">
          {title}
          {meta && <div className="meta">{meta}</div>}
        </span>
      </label>
      {tag}
      {trailing}
    </div>
  );
}
