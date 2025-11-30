'use client';

import { useEffect } from 'react';

import { useModeStore } from '@/stores/modeStore';

/**
 * Component that ensures Zustand stores are hydrated before rendering.
 * This should be placed early in the component tree.
 */
export const StoreHydration = () => {
  useEffect(() => {
    // Force immediate rehydration of mode store
    if (typeof window !== 'undefined') {
      // Trigger rehydration - the onRehydrateStorage callback in the store config will handle setting _hasHydrated
      useModeStore.persist.rehydrate();
    }
  }, []);

  return null;
};
