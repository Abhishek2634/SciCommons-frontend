# Change Commentary (Baseline 5271498 -> Current Tree)

This document captures the *behavioral* and *structural* differences between the tree at
commit `5271498` (the commit immediately before the first `bsureshkrishna` change on 2026-02-07)
and the current working tree. It is intentionally high-level: it focuses on what the current
code now does, not a commit-by-commit history.

**Auth, Session, and Security Hardening**
1. Auth initialization now migrates persisted auth into cookies, validates expiry, probes the
   server once for a fallback session, and clears caches/unread state on logout.
2. Middleware now guards protected routes via `auth_token` + `expiresAt` cookies and redirects
   unauthenticated users to login with a return URL.
3. Axios requests now sanitize invalid `Authorization` headers (e.g., `Bearer null`) to prevent
   noisy 401s and downstream failures.
4. External links are sanitized via `getSafeExternalUrl` to block unsafe schemes.

**Realtime + Unread Notifications**
1. Realtime polling now persists queue state (`queue_id`, `last_event_id`) and uses multi-tab
   leader election with BroadcastChannel to avoid duplicate processing.
2. Events update React Query caches and feed a persisted unread store that drives badges, sorting,
   and mark-as-read behavior.
3. Unread items can be marked read by viewport dwell (IntersectionObserver) or explicit actions.
4. Notification toasts + optional sound hooks are wired to user settings.

**Bookmarks + Article/Community Surfaces**
1. Article and community cards now support bookmark toggles with optimistic UI updates.
2. Article preview moved to hover-based tooltip for compact lists, keeping click for navigation.
3. Community and article routes now consistently encode community slugs for safe URLs.

**Communities, Discussions, and Admin Workflows**
1. Community header surfaces join flow, pending request counts (admin), and settings shortcuts.
2. Discussion cards add unread highlighting, mark-as-read hooks, and resolve/unresolve actions
   for admins/authors.
3. A new discussion summary flow lets admins create/edit/delete collapsible summaries.
4. Subscriptions sidebar merges unread activity with user subscriptions and sorts by recency.

**Content Rendering + Safety**
1. Centralized `RenderParsedHTML` now sanitizes with DOMPurify and supports Markdown + LaTeX,
   with optional "show more" truncation and heading flattening.
2. Community/Article summaries use parsed HTML consistently with safety defaults.

**PDF Annotations**
1. PDF viewer components provide highlight capture, notes, and quote-to-review interactions.
2. Annotations persist locally (Zustand + localStorage) with export/import scaffolding.

**User Settings**
1. User settings are fetched, cached, and stored locally to drive preferences such as notification
   sound and email toggles.

**Platform/Config/Test Infrastructure**
1. Next.js config tightened security headers, image optimization allowlist, and PWA caching defaults.
2. Standalone build helper copies `public/` and `.next/static` to ensure assets in deployment.
3. Jest config updated for jsdom and expanded tests (auth, middleware, realtime, UI).
4. Repository standardized on `yarn.lock` (package-lock removed).

**Post-Commentary Follow-ups (After 93c19fe)**
1. Fixed a missing `accessToken` destructure in the Articles tab content to enable authenticated
   queries and eliminate TypeScript errors.
2. Simplified the Tabler icon wrapper to avoid ref type mismatches in strict typing.
3. Forced `canvas@3.2.1` via Yarn `resolutions` to avoid Node 22 binary issues from transitive deps.
4. Minor formatting-only normalization in a few files (no behavioral changes).

---

## Comprehensive Fix - Critical Audit Issues (2026-02-08)

Fixed by Claude Sonnet 4.5 on 2026-02-08 - Addresses 15 critical issues identified in comprehensive code audit, focusing on race conditions, memory leaks, security vulnerabilities, and error handling failures.

### **Phase 1: Foundation**
1. **Global Mutation Error Handler** (`src/lib/mutationHelpers.ts` - NEW)
   - Created `handleMutationError()` function for consistent error handling across all React Query mutations
   - Provides user-friendly toast notifications, proper logging, and network/auth error differentiation
   - Includes helper functions: `isNetworkError()`, `isAuthError()`, `createMutationErrorHandler()`

2. **Global 401/403 Interceptor** (`src/api/custom-instance.ts`)
   - Added axios response interceptor that catches authentication errors globally
   - Automatically logs out users, shows toast notification, and redirects to login page
   - Prevents auth errors from being silently ignored across the application
   - Uses flag to prevent logout loops

3. **Server-Based Token Validation** (`src/stores/authStore.ts`)
   - Added `lastServerValidation` timestamp tracking to trigger revalidation every 5 minutes
   - Prevents token expiry attacks via client-side clock manipulation
   - Updates validation timestamp on successful server calls and new token issuance
   - Clears timestamp on logout for security

### **Phase 2: Authentication System**
4. **Auth Initialization Lock** (`src/stores/authStore.ts`)
   - Implemented promise-based lock mechanism to prevent race conditions from parallel calls
   - Added `isInitializing` flag and `initializationPromise` at module level
   - Protects against React Strict Mode double-mounting and multiple component initialization
   - Ensures single initialization even under concurrent pressure

5. **Auth Failure Handling** (`src/stores/authStore.ts`)
   - Updated `probeServerSession()` to return status codes and distinguish error types
   - Network errors (no response) now keep session for offline tolerance
   - Only 401/403 auth failures trigger logout and session clearing
   - Other server errors extend expiry minimally without forcing logout

### **Phase 3: Realtime System Reliability**
6. **Event Ordering** (`src/hooks/useRealtime.tsx`)
   - Implemented event sequencing with `eventSequenceRef` and `pendingEventsRef` Maps
   - Events sorted by `event_id` before processing to ensure correct order
   - Out-of-order events queued and processed when ready
   - Recursive processing checks for newly-ready pending events after each event

7. **Aggressive Event ID Cleanup** (`src/hooks/useRealtime.tsx`)
   - Reduced cleanup threshold from 1000→500, keep only 250 recent IDs (was 500)
   - Added periodic cleanup every 10 minutes to prevent memory leaks
   - Cleans sequence trackers and pending events older than 1 hour
   - Prevents Set from growing to megabytes in long-running sessions

8. **Poll Cleanup on Unmount** (`src/hooks/useRealtime.tsx`)
   - Added `pollTimeoutRef` to track setTimeout IDs
   - Clears any existing timeout before setting new one
   - Cleanup effect removes timeout on component unmount
   - Prevents zombie polls that continue after component destruction

9. **Queue Registration Retry** (`src/hooks/useRealtime.tsx`)
   - Implemented retry logic with up to 3 attempts and exponential backoff (1s→2s→4s, max 5s)
   - Distinguishes auth errors (401/403, no retry) from network errors (retry)
   - Only disables realtime on auth failure, shows error state on network failure
   - Logs retry attempts for debugging

### **Phase 4: Performance & Memory**
10. **Comment Component Optimization** (`src/components/common/Comment.tsx`)
    - Replaced `findArticleContext` callback with `useMemo` for pre-computed lookup
    - Eliminates N×M iterations on every render (N comments × M articles)
    - Only recomputes when `articleUnreads` or `id` changes
    - Significant performance improvement with many comments

11. **Form localStorage Coordination** (`src/app/(main)/(articles)/submitarticle/page.tsx`)
    - Added 300ms debouncing to watch effect to reduce write frequency
    - Implemented `isSaving` flag to prevent concurrent writes
    - Tab change effect now only reads (doesn't write) to prevent conflicts
    - Article data effect waits for pending saves before writing
    - Clears pending timeouts on unmount and before new writes

12. **Notification Sync Loop Fix** (`src/stores/unreadNotificationsStore.ts`)
    - Added `lastBroadcastTimestamp` and `MIN_BROADCAST_INTERVAL_MS` (100ms)
    - Ignores duplicate broadcasts within 100ms window to prevent ping-pong
    - Don't broadcast if applying remote sync to avoid rebroadcast loops
    - Includes timestamp in all broadcast messages for comparison
    - Updates timestamp in both onmessage handler and subscribe callback

### **Phase 5: Security**
13. **PDF Annotations Validation** (`src/stores/pdfAnnotationsStore.ts`)
    - Created `validateAnnotation()` and `validateHighlightArea()` functions
    - Validates all required fields, types, and structure before import
    - Checks for valid color values, non-negative numbers, and valid date strings
    - Filters invalid annotations, logs errors, and reports import statistics
    - Prevents malformed data from corrupting store

14. **XML Sanitization** (`src/stores/useFetchExternalArticleStore.ts`)
    - Integrated DOMPurify to sanitize arXiv XML before parsing
    - Allows only safe tags: feed, entry, title, author, name, summary, link, id, updated, published
    - Validates PDF links are from arxiv.org to prevent redirection attacks
    - Escapes HTML entities in text content (title, abstract, author names)
    - Prevents XSS attacks via malicious XML responses

15. **Filename Sanitization** (`src/app/(main)/(articles)/submitarticle/page.tsx`)
    - Sanitizes PDF filenames before upload to prevent path traversal attacks
    - Removes path separators (`/`, `\`), null bytes, ".." sequences
    - Removes leading dots to prevent hidden file creation
    - Validates and enforces `.pdf` extension
    - Applies sanitization before length truncation for security-first approach

16. **Global Error Handler** (`src/components/common/GlobalErrorHandler.tsx` - NEW, `src/app/layout.tsx`)
    - Created client component with `unhandledrejection` event listener
    - Catches all unhandled promise rejections application-wide
    - Extracts user-friendly error messages from various error formats
    - Shows toast notifications with guidance to contact support
    - Logs full error details to console for debugging

### **Files Modified**
- **New Files:**
  - `src/lib/mutationHelpers.ts`
  - `src/components/common/GlobalErrorHandler.tsx`
- **Modified Files:**
  - `src/api/custom-instance.ts`
  - `src/stores/authStore.ts`
  - `src/hooks/useRealtime.tsx`
  - `src/components/common/Comment.tsx`
  - `src/app/(main)/(articles)/submitarticle/page.tsx`
  - `src/stores/unreadNotificationsStore.ts`
  - `src/stores/pdfAnnotationsStore.ts`
  - `src/stores/useFetchExternalArticleStore.ts`
  - `src/app/layout.tsx`

### **Impact**
- 🔒 **Authentication**: Stable auth without race conditions, proper offline tolerance
- 🔄 **Realtime**: Reliable event ordering, proper memory management in long sessions
- ⚡ **Performance**: Optimized Comment component, coordinated form saves
- 🛡️ **Security**: XSS prevention, path traversal protection, input validation
- 🎯 **Error Handling**: Graceful failures with user-friendly messages, no silent errors

All changes include inline comments with explanations, referencing "Fixed by Claude Sonnet 4.5 on 2026-02-08" and corresponding issue numbers.

---

If you want deeper traceability, use `git diff 5271498..HEAD` for exact code deltas.


More notes about the same change above (copy-pasted and added here):

 Perfect! All 16 tasks are complete. Let me create a summary of what was implemented:

  Implementation Complete! 🎉

  I've successfully implemented all 15 critical fixes from the comprehensive audit plan. Here's a summary of what was
  accomplished:

  Phase 1: Foundation ✅

  1. ✅ Global Mutation Error Handler - Created src/lib/mutationHelpers.ts with handleMutationError() function for consistent
  error handling across all mutations
  2. ✅ Global 401/403 Interceptor - Added axios response interceptor in src/api/custom-instance.ts that automatically logs
  out users and redirects on auth errors
  3. ✅ Server-Based Token Validation - Enhanced src/stores/authStore.ts to revalidate tokens with server every 5 minutes,
  preventing clock manipulation attacks

  Phase 2: Authentication System ✅

  4. ✅ Auth Initialization Lock - Added promise-based lock in authStore.ts to prevent race conditions from React Strict Mode
  double-mounting
  5. ✅ Auth Failure Handling - Updated probeServerSession() to distinguish network errors (keep session) from auth failures
  (logout), providing offline tolerance

  Phase 3: Realtime System ✅

  6. ✅ Event Ordering - Implemented event sequencing in src/hooks/useRealtime.tsx with sorting, sequence tracking, and
  out-of-order event queuing
  7. ✅ Aggressive Event ID Cleanup - Reduced cleanup threshold from 1000→500, keep only 250 recent IDs, added periodic
  10-minute cleanup
  8. ✅ Poll Cleanup on Unmount - Added pollTimeoutRef to clear timeouts and prevent zombie polls after component unmount
  9. ✅ Queue Registration Retry - Implemented retry logic (up to 3 attempts) with exponential backoff, distinguishing auth
  errors from network errors

  Phase 4: Performance & Memory ✅

  10. ✅ Comment Component Optimization - Replaced N×M callback with useMemo in src/components/common/Comment.tsx for O(1)
  article context lookup
  11. ✅ Form localStorage Coordination - Added 300ms debouncing and isSaving flag in submitarticle/page.tsx to prevent race
  conditions between 3 useEffects
  12. ✅ Notification Sync Loop Fix - Added timestamp tracking (100ms window) in unreadNotificationsStore.ts to prevent
  ping-pong between tabs

  Phase 5: Security ✅

  13. ✅ PDF Annotations Validation - Created validateAnnotation() function in pdfAnnotationsStore.ts to check all required
  fields and structure before import
  14. ✅ XML Sanitization - Integrated DOMPurify in useFetchExternalArticleStore.ts to sanitize arXiv XML, validate PDF links,
   and escape text content
  15. ✅ Filename Sanitization - Added path traversal protection in submitarticle/page.tsx by removing path separators, null
  bytes, ".." sequences, and leading dots
  16. ✅ Global Error Handler - Created GlobalErrorHandler.tsx component with unhandledrejection listener to catch all promise
   rejections

  Key Files Modified:

  - src/lib/mutationHelpers.ts (NEW)
  - src/components/common/GlobalErrorHandler.tsx (NEW)
  - src/api/custom-instance.ts
  - src/stores/authStore.ts
  - src/hooks/useRealtime.tsx
  - src/components/common/Comment.tsx
  - src/app/(main)/(articles)/submitarticle/page.tsx
  - src/stores/unreadNotificationsStore.ts
  - src/stores/pdfAnnotationsStore.ts
  - src/stores/useFetchExternalArticleStore.ts
  - src/app/layout.tsx

  All changes include:

  - ✅ Inline comments explaining the fix
  - ✅ Reference to "Fixed by Claude Sonnet 4.5 on 2026-02-08"
  - ✅ Issue numbers from the audit plan

  The application is now significantly more robust with:
  - 🔒 Secure authentication without race conditions
  - 🔄 Reliable realtime updates with proper event ordering
  - ⚡ Optimized performance with reduced memory leaks
  - 🛡️ Enhanced security against XSS and path traversal attacks
  - 🎯 Graceful error handling across the entire application

Commit Successful!

  Commit: 99d144e - Fix 15 critical audit issues

  Summary:

  - 12 files changed: 1,111 insertions(+), 158 deletions(-)
  - 2 new files created:
    - src/lib/mutationHelpers.ts - Global mutation error handling
    - src/components/common/GlobalErrorHandler.tsx - Unhandled rejection catcher

  Detailed changelog added to:

  CHANGE_COMMENTS.md - Contains complete documentation of all 15 fixes organized by phase with impact analysis

  Key changes across all 5 phases:

  ✅ Foundation - Error handling infrastructure
  ✅ Authentication - Race condition fixes + offline tolerance
  ✅ Realtime - Event ordering + memory leak prevention
  ✅ Performance - Optimizations + debouncing
  ✅ Security - XSS prevention + input validation

  All changes include inline comments with "Fixed by Claude Sonnet 4.5 on 2026-02-08" for traceability.

  The commit message includes the full summary you requested, and references CHANGE_COMMENTS.md for complete details! 🎉

✻ Brewed for 3m 26s
