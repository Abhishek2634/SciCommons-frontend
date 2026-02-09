import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// NOTE(bsureshkrishna, 2026-02-07): Added persistent unread tracking after baseline 5271498.
// Tracks unread discussions/comments per community+article, supports cross-tab sync,
// and powers activity sorting + badge counts in the discussions UI.
// Types
export interface UnreadItem {
  id: number;
  type: 'discussion' | 'comment' | 'reply';
  discussionId?: number; // For comments/replies
  parentId?: number | null; // For nested replies
  timestamp: number;
}

export interface ArticleUnreadState {
  articleId: number;
  communityId: number;
  items: UnreadItem[];
  lastActivityAt: number;
}

interface UnreadNotificationsState {
  // Map key: `${communityId}-${articleId}`
  articleUnreads: Record<string, ArticleUnreadState>;

  // Actions
  addUnreadItem: (
    communityId: number,
    articleId: number,
    item: Omit<UnreadItem, 'timestamp'>
  ) => void;
  markItemRead: (
    communityId: number,
    articleId: number,
    itemId: number,
    type: 'discussion' | 'comment' | 'reply'
  ) => void;
  markDiscussionItemsRead: (communityId: number, articleId: number, discussionId: number) => void;
  markArticleRead: (communityId: number, articleId: number) => void;
  getUnreadCount: (communityId: number, articleId: number) => number;
  getTotalUnreadCount: () => number;
  getArticlesSortedByActivity: () => ArticleUnreadState[];
  isItemUnread: (itemId: number, type: 'discussion' | 'comment' | 'reply') => boolean;
  clearAll: () => void;
}

// Helper to generate consistent keys
const getArticleKey = (communityId: number, articleId: number): string =>
  `${communityId}-${articleId}`;

// Cleanup items older than 7 days
const CLEANUP_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const cleanupOldItems = (
  articleUnreads: Record<string, ArticleUnreadState>
): Record<string, ArticleUnreadState> => {
  const cutoff = Date.now() - CLEANUP_THRESHOLD_MS;
  const cleaned: Record<string, ArticleUnreadState> = {};

  Object.entries(articleUnreads).forEach(([key, article]) => {
    const filteredItems = article.items.filter((item) => item.timestamp > cutoff);
    // Only keep articles that have items or recent activity
    if (filteredItems.length > 0 || article.lastActivityAt > cutoff) {
      cleaned[key] = {
        ...article,
        items: filteredItems,
      };
    }
  });

  return cleaned;
};

export const useUnreadNotificationsStore = create<UnreadNotificationsState>()(
  persist(
    (set, get) => ({
      articleUnreads: {},

      addUnreadItem: (communityId, articleId, item) => {
        const key = getArticleKey(communityId, articleId);
        const now = Date.now();

        set((state) => {
          const existing = state.articleUnreads[key];

          // Check if item already exists to prevent duplicates
          if (existing?.items.some((i) => i.id === item.id && i.type === item.type)) {
            // Update lastActivityAt even if item exists
            return {
              articleUnreads: {
                ...state.articleUnreads,
                [key]: {
                  ...existing,
                  lastActivityAt: now,
                },
              },
            };
          }

          const newItem: UnreadItem = {
            ...item,
            timestamp: now,
          };

          if (existing) {
            return {
              articleUnreads: {
                ...state.articleUnreads,
                [key]: {
                  ...existing,
                  items: [...existing.items, newItem],
                  lastActivityAt: now,
                },
              },
            };
          }

          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                articleId,
                communityId,
                items: [newItem],
                lastActivityAt: now,
              },
            },
          };
        });
      },

      markItemRead: (communityId, articleId, itemId, type) => {
        const key = getArticleKey(communityId, articleId);

        set((state) => {
          const existing = state.articleUnreads[key];
          if (!existing) return state;

          const filteredItems = existing.items.filter(
            (item) => !(item.id === itemId && item.type === type)
          );

          // If no items left, we can remove the article entry but keep lastActivityAt for sorting
          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                ...existing,
                items: filteredItems,
              },
            },
          };
        });
      },

      markDiscussionItemsRead: (communityId, articleId, discussionId) => {
        const key = getArticleKey(communityId, articleId);

        set((state) => {
          const existing = state.articleUnreads[key];
          if (!existing) return state;

          // Remove all items related to this discussion (comments and replies)
          // Keep discussions and items that belong to other discussions
          const filteredItems = existing.items.filter(
            (item) => item.type === 'discussion' || item.discussionId !== discussionId
          );

          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                ...existing,
                items: filteredItems,
              },
            },
          };
        });
      },

      markArticleRead: (communityId, articleId) => {
        const key = getArticleKey(communityId, articleId);

        set((state) => {
          const existing = state.articleUnreads[key];
          if (!existing) return state;

          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                ...existing,
                items: [], // Clear all items but keep the entry for sorting
              },
            },
          };
        });
      },

      getUnreadCount: (communityId, articleId) => {
        const key = getArticleKey(communityId, articleId);
        const article = get().articleUnreads[key];
        return article?.items.length ?? 0;
      },

      getTotalUnreadCount: () => {
        const { articleUnreads } = get();
        return Object.values(articleUnreads).reduce(
          (total, article) => total + article.items.length,
          0
        );
      },

      getArticlesSortedByActivity: () => {
        const { articleUnreads } = get();
        return Object.values(articleUnreads).sort((a, b) => b.lastActivityAt - a.lastActivityAt);
      },

      isItemUnread: (itemId, type) => {
        const { articleUnreads } = get();
        return Object.values(articleUnreads).some((article) =>
          article.items.some((item) => item.id === itemId && item.type === type)
        );
      },

      clearAll: () => {
        set({ articleUnreads: {} });
      },
    }),
    {
      name: 'unread-notifications-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clean up old items on rehydration
          state.articleUnreads = cleanupOldItems(state.articleUnreads);
        }
      },
    }
  )
);

// BroadcastChannel for cross-tab sync
const BROADCAST_CHANNEL_NAME = 'unread-notifications-sync';
// NOTE(Codex for bsureshkrishna, 2026-02-09): Tag outbound syncs so we can ignore
// our own updates and prevent cross-tab ping-pong.
const BROADCAST_SENDER_ID =
  typeof window !== 'undefined' ? `${Date.now()}-${Math.random().toString(36).slice(2)}` : 'server';

let broadcastChannel: BroadcastChannel | null = null;
// NOTE(Codex for bsureshkrishna, 2026-02-09): Guard against rebroadcast loops when
// applying remote sync payloads.
let isApplyingRemoteSync = false;

// Fixed by Claude Sonnet 4.5 on 2026-02-08
// Issue 10: Track broadcast timestamps to prevent ping-pong between tabs
let lastBroadcastTimestamp = 0;
const MIN_BROADCAST_INTERVAL_MS = 100; // Ignore broadcasts within 100ms window

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

  // Listen for updates from other tabs
  broadcastChannel.onmessage = (event) => {
    const { type, payload, senderId, timestamp } = event.data ?? {};
    if (senderId && senderId === BROADCAST_SENDER_ID) return;

    if (type === 'sync') {
      // Fixed by Claude Sonnet 4.5 on 2026-02-08
      // Issue 10: Ignore duplicate broadcasts within 100ms window to prevent loops
      if (timestamp && Math.abs(timestamp - lastBroadcastTimestamp) < MIN_BROADCAST_INTERVAL_MS) {
        return;
      }

      // Sync the entire state from another tab without rebroadcasting.
      isApplyingRemoteSync = true;
      useUnreadNotificationsStore.setState({ articleUnreads: payload });
      isApplyingRemoteSync = false;

      // Update timestamp after applying remote sync
      if (timestamp) {
        lastBroadcastTimestamp = timestamp;
      }
    }
  };

  // Subscribe to store changes and broadcast to other tabs
  useUnreadNotificationsStore.subscribe((state) => {
    if (isApplyingRemoteSync) return;

    // Fixed by Claude Sonnet 4.5 on 2026-02-08
    // Issue 10: Don't broadcast if we just received a broadcast (within 100ms)
    const now = Date.now();
    if (now - lastBroadcastTimestamp < MIN_BROADCAST_INTERVAL_MS) {
      return;
    }

    lastBroadcastTimestamp = now;
    broadcastChannel?.postMessage({
      type: 'sync',
      payload: state.articleUnreads,
      senderId: BROADCAST_SENDER_ID,
      timestamp: now, // Include timestamp in message
    });
  });
}

// Export helper for external sync trigger
export const syncUnreadNotifications = () => {
  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 10: Include timestamp in external sync broadcasts
  const now = Date.now();
  lastBroadcastTimestamp = now;
  const state = useUnreadNotificationsStore.getState();
  broadcastChannel?.postMessage({
    type: 'sync',
    payload: state.articleUnreads,
    senderId: BROADCAST_SENDER_ID,
    timestamp: now,
  });
};
