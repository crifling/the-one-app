import type { Priority } from '../../store/types';

const LABELS: Record<Priority, string> = {
  high: 'Vigtig',
  normal: 'Normal',
  low: 'Kan vente',
};

const CLASS: Record<Priority, string> = {
  high: 'tag warm',
  normal: 'tag muted',
  low: 'tag muted',
};

export function PriorityTag({ priority }: { priority: Priority }) {
  return <span className={CLASS[priority]}>{LABELS[priority]}</span>;
}

export const PRIORITY_LABELS = LABELS;
