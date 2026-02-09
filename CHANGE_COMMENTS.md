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

---

## Article Card Title Link Fix (2026-02-08)

Fixed by Claude Sonnet 4.5 on 2026-02-08

**Problem**: The title link in ArticleCard extended across the full width of the card even when the title text was short. This made it difficult to click the card itself (which triggers a different action than the title link), because most of the card area showed a link cursor. This was particularly problematic in sidebar views (articles page, community page) where card clicking opens article in right panel and title clicking opens article page.

**Root Cause**: The `<Link>` component originally had `className="flex w-full..."` and wrapped both title and buttons. Initial fix attempt used `flex-1` which still caused the link to grow to fill available space.

**Solution Evolution**:
1. First attempt: Restructured component (Link only wraps title, buttons separate) but used `inline-flex flex-1` ❌ Still too wide due to flex-1
2. Final fix: Changed to `className="inline-block"` ✅ Link is ONLY as wide as title text
   - `inline-block`: Element is only as wide as its content, no flex growth
   - Parent div uses `flex justify-between` to position buttons
   - No flex properties on Link means no unwanted expansion

**Result**: The link cursor now only appears when hovering over actual title text, not empty space to the right. Makes clicking the card much easier in all views.

**Files Modified**:
- `src/components/articles/ArticleCard.tsx` (lines 122-147)
- Commits: 5cd1b7c (structure), 5742a47 (docs), 8643337 (final CSS fix)

---

## Logout Redirect After Logout (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: After logout, users stayed on the current page with only a toast, which could leave a stale view on protected pages.
**Root Cause**: The profile dropdown logout handler only invoked a toast and did not navigate away.
**Solution**: Replace the toast with a router redirect to `/` immediately after logout.
**Result**: Users land on the public home page after logout, reducing confusion and stale UI.
**Files Modified**:
- `src/components/common/NavBar.tsx`
- Commit: (this commit)

---

## Login Success Toast Removed (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: A "Logged in successfully" toast appeared after every successful login, even though the redirect already communicated success.
**Root Cause**: The login success handler explicitly triggered a success toast on sign-in.
**Solution**: Commented out the success toast call (and its import) while keeping a documented inline comment for the change.
**Result**: Login now transitions directly to the redirect without an extra toast.
**Files Modified**:
- `src/app/(authentication)/auth/login/page.tsx`

---

## AuthStore Invalid Expiry Test Fix (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: `authStore` test expected cookie removal on invalid expiry, but the updated auth flow now probes the server and keeps sessions on network/unknown errors.
**Root Cause**: The test did not provide a deterministic auth failure response after the 2026-02-08 auth hardening changes.
**Solution**: Mocked `NEXT_PUBLIC_BACKEND_URL` and `fetch` to return a 401 so the logout/clear-cookies path is exercised.
**Result**: The test now aligns with the intended behavior and passes reliably.
**Files Modified**:
- `src/tests/__tests__/authStore.test.ts`

---

## AuthStore Offline Tolerance Test (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: The offline-tolerance branch (network failure during invalid expiry) was untested after the auth hardening changes.
**Root Cause**: Existing tests only validated the 401/403 cleanup path, not the keep-session behavior.
**Solution**: Added a test that mocks a backend URL and a rejected `fetch` to exercise the network-error branch.
**Result**: The test suite now covers the keep-session behavior without clearing cookies.
**Files Modified**:
- `src/tests/__tests__/authStore.test.ts`

---

## AuthStore Test Cleanup Typing Fix (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: `tsc --skipLibCheck --noEmit` failed in pre-commit due to deleting the non-optional global `fetch` during test cleanup.
**Root Cause**: TypeScript disallows the `delete` operator on required global properties.
**Solution**: Introduced a typed helper that treats `fetch` as optional and restores it by assignment instead of deletion.
**Result**: Test cleanup remains deterministic and TypeScript compilation passes.
**Files Modified**:
- `src/tests/__tests__/authStore.test.ts`

---

## Discussion Add Comment Collapse (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: In the discussion sidebar, the Add Comment form stayed open after posting, leaving an unnecessary input box above the newly added comment.
**Root Cause**: The create-comment success handler refetched comments but did not reset the collapse state.
**Solution**: Collapse the Add Comment form (`+` state) on successful comment creation.
**Result**: After posting, the comment form closes automatically, matching expected sidebar behavior.
**Files Modified**:
- `src/components/articles/DiscussionComments.tsx`

---

## Article Title Min Length Consistency (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: Article title validation used 5 characters on create but 10 characters on edit, creating inconsistent rules.
**Root Cause**: The edit form hard-coded a different minimum length value than the create form.
**Solution**: Added a shared `ARTICLE_TITLE_MIN_LENGTH` constant (set to 5) and referenced it in both create and edit forms.
**Result**: Title length validation is consistent across create and edit flows.
**Files Modified**:
- `src/constants/common.constants.tsx`
- `src/components/articles/SubmitArticleForm.tsx`
- `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx`

---

## Article Settings UX Cleanup (2026-02-09)

Fixed by Codex on 2026-02-09

**Problem**: The article settings page required an extra edit toggle before fields were editable, showed community-focused helper text, and used a misleading “Submit Article” button label.
**Root Cause**: The edit screen was ported from community settings patterns and retained the edit-lock toggle and copy.
**Solution**: Keep article settings fields editable on arrival, update helper text to article language, and rename the primary action to “Update Article.”
**Result**: Editing is immediate and the UI messaging matches the article context.
**Files Modified**:
- `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/page.tsx`
- `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx`

---

If you want deeper traceability, use `git diff 5271498..HEAD` for exact code deltas.
