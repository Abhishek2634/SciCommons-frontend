import { useEffect, useState } from 'react';

import { useModeStore } from '@/stores/modeStore';

/**
 * Hook to safely access mode store without hydration errors.
 * Returns the mode only after client-side hydration is complete.
 * Always returns 'advanced' during SSR and initial render to prevent hydration mismatches.
 */
export const useMode = () => {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const mode = useModeStore((state) => state.mode);
  const hasHydrated = useModeStore((state) => state._hasHydrated);

  useEffect(() => {
    // Set mounted flag
    setMounted(true);

    // Check if store is already hydrated
    if (hasHydrated) {
      setHydrated(true);
      return;
    }

    // Wait for hydration
    const checkHydration = () => {
      const currentState = useModeStore.getState();
      if (currentState._hasHydrated) {
        setHydrated(true);
      } else {
        // Check again after a short delay
        setTimeout(checkHydration, 10);
      }
    };

    // Start checking
    checkHydration();

    // Fallback: always set hydrated after max 100ms to prevent infinite waiting
    const fallback = setTimeout(() => {
      setHydrated(true);
    }, 100);

    return () => clearTimeout(fallback);
  }, [hasHydrated]);

  // During SSR, always return default
  if (typeof window === 'undefined') {
    return 'advanced';
  }

  // On client: return default until both mounted and hydrated
  // This ensures initial client render matches server render
  return mounted && hydrated && hasHydrated ? mode : 'advanced';
};

/**
 * Hook to check if component is mounted (client-side only).
 * Use this to conditionally apply styles that depend on localStorage.
 */
export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
