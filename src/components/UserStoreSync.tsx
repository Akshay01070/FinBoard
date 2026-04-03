'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useDashboardStore } from '@/store/dashboardStore';

const STORAGE_PREFIX = 'finboard-user-';
const LEGACY_KEY = 'finboard-storage';

/**
 * Serializes current store state for saving to localStorage.
 * Strips out transient fields (loading, error, cached data).
 */
function serializeStore() {
  const state = useDashboardStore.getState();
  return JSON.stringify({
    widgets: state.widgets.map((w) => ({
      ...w,
      isLoading: false,
      error: null,
      cachedData: undefined,
    })),
    theme: state.theme,
  });
}

/**
 * UserStoreSync bridges Clerk auth with per-user localStorage persistence.
 *
 * - On sign-in: loads user-specific dashboard data from `finboard-user-{userId}`
 * - On store changes: auto-saves to the user's key
 * - On sign-out: saves current data, resets store
 * - Migrates legacy shared `finboard-storage` data to the first user who signs in
 */
export default function UserStoreSync() {
  const { userId, isLoaded } = useAuth();
  const userIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // Save data for a specific user
  const saveForUser = useCallback((uid: string) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + uid, serializeStore());
    } catch {
      // localStorage might be full — fail silently
    }
  }, []);

  // Load data for a specific user
  const loadForUser = useCallback((uid: string) => {
    const store = useDashboardStore.getState();

    // Try loading user-specific data
    let raw = localStorage.getItem(STORAGE_PREFIX + uid);

    // If no user-specific data, check for legacy shared data and migrate it
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        try {
          const legacyData = JSON.parse(legacyRaw);
          // Zustand persist wraps data in { state: {...}, version: N }
          const legacyState = legacyData.state || legacyData;
          if (legacyState.widgets && legacyState.widgets.length > 0) {
            raw = JSON.stringify({
              widgets: legacyState.widgets,
              theme: legacyState.theme || 'dark',
            });
            // Save migrated data to user-specific key
            localStorage.setItem(STORAGE_PREFIX + uid, raw);
            // Remove legacy key to avoid re-migration for other users
            localStorage.removeItem(LEGACY_KEY);
          }
        } catch {
          // Invalid legacy data, ignore
        }
      }
    }

    if (raw) {
      try {
        const data = JSON.parse(raw);
        store._loadWidgets(data.widgets || [], data.theme || 'dark');
        store._setHydrated(true);
        return;
      } catch {
        // Corrupt data — fall through to empty state
      }
    }

    // New user or corrupt data — start fresh
    store._loadWidgets([], store.theme);
    store._setHydrated(true);
  }, []);

  // Handle user changes (sign-in, sign-out, account switch)
  useEffect(() => {
    if (!isLoaded) return;

    const prevUserId = userIdRef.current;

    // Skip if user hasn't changed and we've already initialized
    if (prevUserId === userId && isInitializedRef.current) return;

    // Save previous user's data before switching
    if (prevUserId && prevUserId !== userId) {
      saveForUser(prevUserId);
    }

    if (userId) {
      // User signed in — load their data
      loadForUser(userId);
    } else {
      // Signed out — reset to empty dashboard
      const store = useDashboardStore.getState();
      store._loadWidgets([], store.theme);
      store._setHydrated(true);
    }

    userIdRef.current = userId ?? null;
    isInitializedRef.current = true;
  }, [userId, isLoaded, saveForUser, loadForUser]);

  // Auto-save to user's localStorage whenever widgets or theme change
  useEffect(() => {
    if (!isLoaded) return;

    const unsub = useDashboardStore.subscribe((state, prevState) => {
      const uid = userIdRef.current;
      if (!uid) return;

      // Only save when widgets or theme actually change
      const widgetsChanged = state.widgets !== prevState.widgets;
      const themeChanged = state.theme !== prevState.theme;

      if (widgetsChanged || themeChanged) {
        saveForUser(uid);
      }
    });

    return unsub;
  }, [isLoaded, saveForUser]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const uid = userIdRef.current;
      if (uid) {
        saveForUser(uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveForUser]);

  return null;
}
