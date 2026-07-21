import type { LifeAreaId } from '../../store/types';

/** CSS modifier class for a life area's colour accent. */
export function areaClass(area: LifeAreaId): string {
  return area; // matches .icon.<area> / --area-<area>
}

/** A neutral emoji hint per life area (decorative only). */
export function areaEmoji(area: LifeAreaId): string {
  switch (area) {
    case 'family':
      return '❤';
    case 'social':
      return '☕';
    case 'health':
      return '🌿';
    case 'work':
      return '⌘';
    case 'hobby':
      return '✦';
    default:
      return '◎';
  }
}
