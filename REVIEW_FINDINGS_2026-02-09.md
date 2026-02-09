# Review Findings (2026-02-09)

Prepared by Codex for bsureshkrishna on 2026-02-09.

## Findings
1. High: `src/components/common/BottomBar.tsx` uses `React.lazy` for `Drawer` components without a surrounding `Suspense` fallback. This will throw a suspension error on first render in mobile nav, breaking the bottom bar. Wrap lazy components in `Suspense` or switch to `next/dynamic` with a loading fallback.
2. Medium: `src/stores/unreadNotificationsStore.ts` BroadcastChannel sync can ping-pong between tabs. Receiving a `sync` message sets state, which then broadcasts the same payload back, causing endless cross-tab chatter. Add a sender id, a guard, or a payload comparison before rebroadcasting.
3. Medium: `src/hooks/useRealtime.tsx` does not release leader heartbeat on logout. `isLeader` can stay true and the heartbeat keeps writing to localStorage, so other tabs cannot become leader and realtime stalls after logout in one tab. Call `releaseLeadership()` and clear `STORAGE_KEYS.LEADER` when `isAuthenticated` becomes false.
4. Medium: `src/app/(main)/(users)/settings/page.tsx` and `src/app/(main)/(users)/myprofile/page.tsx` are not protected by middleware or `withAuthRedirect`, so unauthenticated users can access UI that expects auth. Combined with `src/stores/userSettingsStore.ts` persistence, a shared machine can show prior user settings. Add route protection and clear user settings on logout.
5. Low: `src/components/pdf/TextSelectionPopup.tsx` and `src/components/pdf/AnnotationSidebar.tsx` call `navigator.clipboard.writeText` without handling failures. Clipboard is blocked on non-secure contexts or denied permissions; add a catch and user-visible toast.
6. Low: `src/hooks/useKeyboardNavigation.ts` captures ArrowUp and ArrowDown globally and prevents default even when typing in inputs. This can break cursor movement in text fields when preview mode is enabled. Add a guard for input, textarea, and contentEditable targets.
7. Low: `src/components/pdf/PDFViewerContainer.tsx` hardcodes the PDF worker to `https://unpkg.com/...`. This can fail under CSP or offline. Consider bundling a local worker or adding a local fallback.

## Scope
1. Config/runtime: `package.json`, `next.config.mjs`, `src/middleware.ts`, `src/app/layout.tsx`, `src/app/(main)/layout.tsx`
2. Auth/session: `src/stores/authStore.ts`, `src/hooks/useAuthHeaders.ts`, `src/HOCs/*`, `src/hooks/useCurrentUser.ts`, `src/hooks/useUserSettings.ts`, `src/stores/userSettingsStore.ts`
3. Realtime/unread: `src/hooks/useRealtime.tsx`, `src/stores/unreadNotificationsStore.ts`, `src/stores/realtimeStore.ts`, `src/app/(main)/discussions/*`, `src/components/articles/Discussion*`
4. Rendering/UI: `src/components/articles/ArticleCard.tsx`, `src/components/articles/DiscussionSummary.tsx`, `src/components/articles/ArticleStats.tsx`, `src/components/common/RenderParsedHTML.tsx`, `src/components/common/TruncateText.tsx`, `src/components/common/EmptyState.tsx`, `src/components/communities/CommunityCard.tsx`, `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/*`
5. PDF/annotations: `src/components/pdf/*`, `src/stores/pdfAnnotationsStore.ts`
6. Notifications/navigation: `src/components/common/NavBar.tsx`, `src/components/common/BottomBar.tsx`, `src/app/(main)/(users)/notifications/page.tsx`, `src/components/common/Notifications.tsx`

## Assumptions / Flags
1. If `/discussions` or `/myprofile` are intended to be auth-only, current protection does not enforce that in middleware. If they are intended to be public, current behavior is acceptable.

## Test Gaps / What Is Important To Cover
1. Unread cross-tab synchronization (no ping-pong, correct unread counts across tabs).
2. Realtime leadership on logout and relogin (leader release, re-election, queue state correctness).
3. Mobile navigation rendering (lazy drawer components with `Suspense` or dynamic fallback).

## Follow-up
1. High/Medium fixes implemented in commit `f87d14c` (auth gating, realtime/unread fixes, documentation).
2. Low-severity fixes implemented in commit `8e1cdbf` (clipboard error handling, keyboard nav guard, PDF worker override).
