import type { Exercise } from '../../store/types';
import { CATEGORY_EMOJI } from './logic';

interface ExerciseThumbProps {
  exercise: Pick<Exercise, 'image' | 'category' | 'title'>;
  /** Box size in px. */
  size?: number;
}

/** Small square thumbnail: the exercise image if present, else a category emoji. */
export function ExerciseThumb({ exercise, size = 50 }: ExerciseThumbProps) {
  if (exercise.image) {
    return (
      <img
        className="exthumb"
        src={exercise.image}
        alt=""
        aria-hidden="true"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="icon" aria-hidden="true" style={{ width: size, height: size }}>
      {CATEGORY_EMOJI[exercise.category]}
    </div>
  );
}
