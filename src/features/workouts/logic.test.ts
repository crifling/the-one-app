import { describe, expect, it } from 'vitest';

import type { Exercise, Program } from '../../store/types';
import {
  categorySupportsWeight,
  defaultStepFor,
  estimateMinutes,
  programSummary,
  resolveTodaysProgram,
  stepDose,
} from './logic';

const exercises: Exercise[] = [
  { id: 'ex1', title: 'Reverse lunges', category: 'speediance', bodyPart: 'legs', image: null, createdAt: '', updatedAt: '' },
  { id: 'ex2', title: 'Plank', category: 'bodyweight', bodyPart: 'core', image: null, createdAt: '', updatedAt: '' },
];

const program: Program = {
  id: 'p1',
  title: 'Ben + core',
  steps: [
    { id: 's1', kind: 'exercise', exerciseId: 'ex1', sets: 3, mode: 'reps', amount: 10, restSeconds: 60, weightKg: 20 },
    { id: 's2', kind: 'pause', seconds: 90 },
    { id: 's3', kind: 'exercise', exerciseId: 'ex2', sets: 3, mode: 'time', amount: 40, restSeconds: 30, weightKg: 0 },
  ],
  createdAt: '',
  updatedAt: '',
};

describe("today's program selection", () => {
  it('resolves the program chosen for today', () => {
    const result = resolveTodaysProgram({ programId: 'p1', date: '2026-07-21' }, [program], '2026-07-21');
    expect(result?.id).toBe('p1');
  });

  it('ignores a selection made on a previous day', () => {
    const result = resolveTodaysProgram({ programId: 'p1', date: '2026-07-20' }, [program], '2026-07-21');
    expect(result).toBeNull();
  });

  it('returns null when nothing is selected', () => {
    expect(resolveTodaysProgram(null, [program], '2026-07-21')).toBeNull();
  });

  it('returns null when the selected program no longer exists', () => {
    const result = resolveTodaysProgram({ programId: 'gone', date: '2026-07-21' }, [program], '2026-07-21');
    expect(result).toBeNull();
  });
});

describe('program summaries & estimates', () => {
  it('counts only exercise steps in the summary', () => {
    expect(programSummary(program)).toContain('2 øvelser');
  });

  it('estimates minutes from work + rest + pauses', () => {
    // ex1: 3×(10×3.5 + 60)=285s; pause 90s; ex2: 3×(40+30)=210s => 585s ≈ 10 min
    expect(estimateMinutes(program)).toBe(10);
  });
});

describe('weight capability', () => {
  it('is enabled for Speediance only (for now)', () => {
    expect(categorySupportsWeight('speediance')).toBe(true);
    expect(categorySupportsWeight('bodyweight')).toBe(false);
    expect(categorySupportsWeight('mobility')).toBe(false);
  });

  it('shows weight in the dose only for weight-capable categories', () => {
    const withWeight = stepDose(program.steps[0] as never, exercises[0]);
    expect(withWeight).toContain('20 kg');
    // Same weight value on a bodyweight exercise is never shown.
    const bwStep = { ...program.steps[0], weightKg: 20 } as never;
    expect(stepDose(bwStep, exercises[1])).not.toContain('kg');
  });
});

describe('default step for a new exercise', () => {
  it('uses reps for strength and time for mobility', () => {
    const strength = defaultStepFor(exercises[0]!);
    expect(strength.mode).toBe('reps');
    expect(strength.amount).toBe(10);

    const mobility = defaultStepFor({ ...exercises[0]!, category: 'mobility' });
    expect(mobility.mode).toBe('time');
    expect(mobility.amount).toBe(40);
  });
});
