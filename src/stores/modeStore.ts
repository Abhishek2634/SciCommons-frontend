import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ReadingMode = 'simple' | 'advanced';

interface ModeState {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'advanced',
      setMode: (mode: ReadingMode) => set({ mode }),
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'mode-preference',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Mode store rehydration error:', error);
          }
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
      skipHydration: false,
    }
  )
);

// Initialize hydration on client side
if (typeof window !== 'undefined') {
  // Force immediate rehydration
  useModeStore.persist.rehydrate();
}
