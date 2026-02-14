import { EntityType, FlagType } from '@/api/schemas';

// Constants for timing
const NEW_TAG_REMOVAL_DELAY_MS = 2000;

/**
 * Helper to check if an entity has the unread flag from API response
 */
export function hasUnreadFlag(flags?: FlagType[]): boolean {
  return flags?.includes(FlagType.unread) ?? false;
}

/**
 * Map entity type string to EntityType enum
 */
export function getEntityType(type: 'discussion' | 'comment' | 'reply'): EntityType {
  if (type === 'discussion') {
    return EntityType.discussion;
  }
  // Both comments and replies use the 'comment' entity type
  return EntityType.comment;
}

// Export constants for use in components
export { NEW_TAG_REMOVAL_DELAY_MS };
