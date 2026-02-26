import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationActivityState {
  ownerUserId: number | null;
  lastBellSeenAt: number;
  lastSystemTabSeenAt: number;
  lastMentionsTabSeenAt: number;
  setOwnerIfNeeded: (userId: number) => void;
  markBellSeen: (userId: number) => void;
  markSystemTabSeen: (userId: number) => void;
  markMentionsTabSeen: (userId: number) => void;
  reset: () => void;
}

const EMPTY_ACTIVITY_STATE = {
  ownerUserId: null,
  lastBellSeenAt: 0,
  lastSystemTabSeenAt: 0,
  lastMentionsTabSeenAt: 0,
} as const;

const createStateForOwner = (userId: number) => ({
  ownerUserId: userId,
  lastBellSeenAt: 0,
  lastSystemTabSeenAt: 0,
  lastMentionsTabSeenAt: 0,
});

/* Fixed by Codex on 2026-02-26
   Who: Codex
   What: Added a persisted notification activity store for bell/system/mentions seen timestamps.
   Why: "New" indicators should reflect unseen activity and clear when users open bell or tabs, independent of read/unread status.
   How: Store per-user last-seen timestamps for the bell and each notifications tab, with owner scoping to avoid cross-account leakage. */
export const useNotificationActivityStore = create<NotificationActivityState>()(
  persist(
    (set) => ({
      ...EMPTY_ACTIVITY_STATE,

      setOwnerIfNeeded: (userId) => {
        set((state) => {
          if (state.ownerUserId === userId) {
            return state;
          }

          return createStateForOwner(userId);
        });
      },

      markBellSeen: (userId) => {
        set((state) => {
          const now = Date.now();
          if (state.ownerUserId !== userId) {
            return {
              ...createStateForOwner(userId),
              lastBellSeenAt: now,
            };
          }

          return {
            lastBellSeenAt: now,
          };
        });
      },

      markSystemTabSeen: (userId) => {
        set((state) => {
          const now = Date.now();
          if (state.ownerUserId !== userId) {
            return {
              ...createStateForOwner(userId),
              lastSystemTabSeenAt: now,
            };
          }

          return {
            lastSystemTabSeenAt: now,
          };
        });
      },

      markMentionsTabSeen: (userId) => {
        set((state) => {
          const now = Date.now();
          if (state.ownerUserId !== userId) {
            return {
              ...createStateForOwner(userId),
              lastMentionsTabSeenAt: now,
            };
          }

          return {
            lastMentionsTabSeenAt: now,
          };
        });
      },

      reset: () => {
        set({
          ...EMPTY_ACTIVITY_STATE,
        });
      },
    }),
    {
      name: 'notification-activity-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);