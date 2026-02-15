import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { useReadItemsStore } from '@/stores/readItemsStore';
import { useSubscriptionUnreadStore } from '@/stores/subscriptionUnreadStore';

import { NEW_TAG_REMOVAL_DELAY_MS, getEntityType } from './useUnreadFlags';

// NOTE(bsureshkrishna, 2026-02-07): Added viewport-based read tracking so unread counts
// clear automatically when users dwell on a discussion/comment (ties into unread store).
interface UseMarkAsReadOnViewOptions {
  entityId: number;
  entityType: 'discussion' | 'comment' | 'reply';
  /** Whether the item has the unread flag from API */
  hasUnreadFlag: boolean;
  /** Article context for tracking which article this item belongs to */
  articleContext?: {
    communityId: number;
    articleId: number;
  };
  /** Delay before starting the mark-as-read process (visibility threshold) */
  visibilityDelay?: number;
}

interface UseMarkAsReadOnViewReturn {
  /** Whether the NEW tag should be shown */
  showNewTag: boolean;
}

/**
 * Hook that uses Intersection Observer to mark an item as read
 * after it has been visible in the viewport for a specified duration.
 *
 * Flow:
 * 1. Check if item is already marked as read in local storage
 * 2. If unread (from API) and not in local read list, show NEW tag
 * 3. When element becomes visible for `visibilityDelay` ms (default 2s):
 *    - Mark as read in local storage (immediate)
 *    - After NEW_TAG_REMOVAL_DELAY_MS (2s), hide the NEW tag
 * 4. Backend sync happens every 2 minutes via the sync manager
 *
 * @param ref - React ref to the DOM element to observe
 * @param options - Configuration options
 * @returns Object with showNewTag state
 */
export function useMarkAsReadOnView(
  ref: RefObject<HTMLElement | null>,
  options: UseMarkAsReadOnViewOptions
): UseMarkAsReadOnViewReturn {
  const { entityId, entityType, hasUnreadFlag, articleContext, visibilityDelay = 2000 } = options;

  const markItemRead = useReadItemsStore((s) => s.markItemRead);
  const isItemRead = useReadItemsStore((s) => s.isItemRead);
  const clearNewEvent = useSubscriptionUnreadStore((s) => s.clearNewEvent);

  // Check if item is already read locally
  const apiEntityType = getEntityType(entityType);
  const isAlreadyRead = isItemRead(entityId, apiEntityType);

  // Item is unread if: has unread flag from API AND not marked as read locally
  const isUnread = hasUnreadFlag && !isAlreadyRead;

  // State for NEW tag visibility
  const [showNewTag, setShowNewTag] = useState(isUnread);

  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tagRemovalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasProcessedRef = useRef(false);

  // Update showNewTag when isUnread changes
  useEffect(() => {
    setShowNewTag(isUnread);
    if (isUnread) {
      hasProcessedRef.current = false;
    }
  }, [isUnread]);

  // Cleanup timeouts
  const clearTimeouts = useCallback(() => {
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current);
      visibilityTimeoutRef.current = null;
    }
    if (tagRemovalTimeoutRef.current) {
      clearTimeout(tagRemovalTimeoutRef.current);
      tagRemovalTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isUnread || !ref.current || hasProcessedRef.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasProcessedRef.current) {
          // Start visibility timer when element becomes visible
          visibilityTimeoutRef.current = setTimeout(() => {
            if (!hasProcessedRef.current) {
              hasProcessedRef.current = true;

              // Mark as read in local storage (immediate)
              if (articleContext) {
                markItemRead(
                  entityId,
                  apiEntityType,
                  articleContext.communityId,
                  articleContext.articleId
                );
                // Also clear the new event flag for this article (for sidebar badge)
                clearNewEvent(articleContext.communityId, articleContext.articleId);
              }

              // Start timer to hide NEW tag
              tagRemovalTimeoutRef.current = setTimeout(() => {
                setShowNewTag(false);
              }, NEW_TAG_REMOVAL_DELAY_MS);
            }
          }, visibilityDelay);
        } else {
          // Clear visibility timer if element leaves viewport before delay completes
          if (visibilityTimeoutRef.current) {
            clearTimeout(visibilityTimeoutRef.current);
            visibilityTimeoutRef.current = null;
          }
        }
      },
      {
        threshold: 0.5, // Element must be at least 50% visible
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [
    ref,
    entityId,
    apiEntityType,
    isUnread,
    visibilityDelay,
    clearTimeouts,
    articleContext,
    markItemRead,
    clearNewEvent,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return { showNewTag };
}

/**
 * Simplified hook for cases where you just need to track visibility
 * and trigger a callback, without the full flag management.
 */
export function useMarkAsReadOnViewSimple(
  ref: RefObject<HTMLElement | null>,
  options: {
    itemId: number;
    type: 'discussion' | 'comment' | 'reply';
    enabled: boolean;
    delay?: number;
    onMarkRead?: () => void;
  }
): void {
  const { itemId, type, enabled, delay = 2000, onMarkRead } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (enabled) {
      hasMarkedRef.current = false;
    }
  }, [enabled, itemId]);

  useEffect(() => {
    if (!enabled || !ref.current || hasMarkedRef.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasMarkedRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (!hasMarkedRef.current) {
              hasMarkedRef.current = true;
              onMarkRead?.();
            }
          }, delay);
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [ref, itemId, type, enabled, delay, onMarkRead]);
}
