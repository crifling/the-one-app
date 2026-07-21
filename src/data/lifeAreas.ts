import type { LifeArea, LifeAreaId } from '../store/types';

/** Fixed, built-in life areas (not user-editable in v1). */
export const LIFE_AREAS: LifeArea[] = [
  { id: 'family', name: 'Familie' },
  { id: 'social', name: 'Socialt' },
  { id: 'health', name: 'Sundhed' },
  { id: 'work', name: 'Arbejde' },
  { id: 'hobby', name: 'Hobby' },
];

const BY_ID: Record<LifeAreaId, LifeArea> = LIFE_AREAS.reduce(
  (acc, area) => {
    acc[area.id] = area;
    return acc;
  },
  {} as Record<LifeAreaId, LifeArea>,
);

export function lifeAreaName(id: LifeAreaId): string {
  return BY_ID[id]?.name ?? id;
}
