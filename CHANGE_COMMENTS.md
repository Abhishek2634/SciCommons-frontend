## 2026-02-19 - Discussion Entity Artifacts and Vote Label Clarity

Problem: Discussion topic/content text displayed raw HTML entities like `&#x20` at line ends, and thread vote controls showed a bare `0` that appeared as an unclear `< 0 >` marker on the right side.

Root Cause: Discussion fields were rendered/reset as raw strings from API payloads without HTML-entity decoding, and vote UI presented only the numeric likes count with no context when the value was zero.

Solution: Added a shared `decodeHtmlEntities` utility in `src/lib/htmlEntities.ts` and applied it in discussion card/thread render paths plus edit-form reset defaults so escaped entities are normalized before display. Updated thread vote text to an explicit label (`{n} votes` or `Vote`) instead of a standalone number.

Result: Discussion text no longer leaks encoded entity artifacts in list/thread views, and the right-side vote widget now reads clearly rather than appearing as stray symbols around `0`.

Files Modified: `src/lib/htmlEntities.ts`, `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionThread.tsx`, `src/tests/__tests__/htmlEntities.test.ts`

Follow-up (same day): Temporarily commented out the thread vote value display in `DiscussionThread` per product request, keeping only upvote/downvote buttons visible.

## 2026-02-18 - Home Supporters Strip GSoC Vertical Alignment

Problem: In the homepage supporters row, the GSoC logo appeared slightly lower than KCDHA and DRAC in desktop layout.

Root Cause: The GSoC image asset's internal bounding box/padding produced a visual baseline offset relative to neighboring logos.

Solution: Added a small desktop-only upward translation (`sm:-translate-y-px`) to both dark and light GSoC logo variants in the supporters strip.

Result: The three supporter logos now appear visually aligned on the same row.

Files Modified: `src/app/(home)/page.tsx`

## 2026-02-18 - Add DRAC to Home Supporters Strip

Problem: The homepage supporters row did not include the newly provided DRAC supporter branding.

Root Cause: `src/app/(home)/page.tsx` rendered only KCDHA and GSoC logos, with no DRAC entries in the supporter image list.

Solution: Added DRAC logos to the supporters row using the same light/dark theme switch pattern already used by other supporters (`dark:block` + `dark:hidden` image pair).

Result: DRAC now appears in the "Our Supporters" section on the homepage and switches correctly between dark and light themes.

Files Modified: `src/app/(home)/page.tsx`

## 2026-02-18 - Docker Build Stability Without Google Fonts Network Access

Problem: `docker compose ... up --build` could fail during `next build` in environments where outbound access to Google Fonts is restricted.

Root Cause: `src/app/layout.tsx` used `next/font/google` (`Manrope` and `Space Grotesk`), which triggers build-time requests to `fonts.googleapis.com`.

Solution: Removed `next/font/google` usage from the root layout and defined `--font-sans` / `--font-display` local fallback stacks in `globals.css` so typography remains stable without remote font fetches.

Result: Frontend builds no longer depend on live Google Fonts access, which improves Docker/CI reliability on restricted networks.

Files Modified: `src/app/layout.tsx`, `src/app/globals.css`

## 2026-02-18 - Community Rules Update Payload Type Alignment

Problem: Running `tsc --skipLibCheck --noEmit` failed with TS2353 in admin rules settings because the update payload included unknown properties.

Root Cause: `AddRules.tsx` sent `tags` and `about` inside `payload.details`, but `UpdateCommunityDetails` only accepts `description`, `type`, `rules`, and optional `community_settings`.

Solution: Updated `AddRules` submit payload to match `UpdateCommunityDetails`, removed unsupported properties, and forwarded existing `community_settings` to preserve current configuration while updating rules.

Result: Type-check now succeeds, lint remains clean, and rules updates are aligned with the generated API schema contract.

Files Modified: `src/app/(main)/(communities)/community/[slug]/(admin)/settings/AddRules.tsx`

## 2026-02-17 - Realtime Logout Abort for In-Flight Poll

Problem: Logging out could still leave one realtime long-poll request active for up to the poll timeout window.

Root Cause: `useRealtime` logout teardown disabled future polling and cleared queue state, but did not abort the currently in-flight poll `fetch` request or clear the pending poll timeout callback.

Solution: Updated logout teardown in `useRealtime` to explicitly abort the active `AbortController` and clear/reset `pollTimeoutRef` before releasing leadership and marking realtime disabled.

Result: Logout now cuts the realtime poll connection immediately instead of waiting for the server response or timeout.

Files Modified: `src/hooks/useRealtime.tsx`

## 2026-02-17 - Comment Toolbars Compaction (Discussion/Review/Post)

Problem: Comment sections consumed extra vertical space because controls were split across multiple rows (including a redundant `Comments:` heading in discussion/review views).

Root Cause: Comment UIs were implemented with separate header and control rows instead of a single compact toolbar, and spacing patterns diverged across discussion, review, and post contexts.

Solution: Refactored comment toolbars to a compact single-row pattern: keep `Add Comment` on the left and place `Depth` + `Expand/Collapse All` controls on the same row when comments exist; removed the superfluous `Comments:` heading where present. Followed up with a small margin tweak above expanded review comments so the toolbar sits with clearer separation from the review card's `{n} comments` toggle row.

Result: Discussion, review, and post comment panes now use less vertical space and behave more consistently while preserving all existing thread controls.

Files Modified: `src/components/articles/DiscussionComments.tsx`, `src/components/articles/ReviewComments.tsx`, `src/components/common/PostComments.tsx`, `src/components/articles/ReviewCard.tsx`

## 2026-02-17 - Discussions/Comments NEW Auto-Expand Hardening (Phase 1)

Problem: NEW badges were visible in discussion/comment flows, but unread discussion threads were not consistently auto-expanding to reveal new activity.

Root Cause: Auto-open logic in `DiscussionCard` depended on `comments_count` being present and greater than zero; when that count was omitted, unread cards with NEW badges stayed collapsed.

Solution: Replayed the discussion/comment unread improvements from `combinedarticlediscussionnewtags` and hardened auto-expand behavior. Added unread-aware expansion plumbing (`autoExpandOnUnread`) through `DiscussionComments` and `RenderComments`, restored subtree unread detection and reply-level NEW badges in `Comment`, and updated `DiscussionCard` to auto-open for unread items unless comment count is explicitly `0` while resetting the one-time guard when unread clears. Added realtime propagation in `useRealtime` so `new_comment` events also mark the parent discussion as ephemeral unread. Updated `useMarkAsReadOnView` with discussion-specific realtime handling so parent discussion NEW can reappear after prior reads without passively clearing the article-level NEW summary badge.

Result: Discussion/comment NEW indicators and unread-path expansion now work together more reliably, including cases where backend discussion counts are missing.

Files Modified: `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionComments.tsx`, `src/components/common/RenderComments.tsx`, `src/components/common/Comment.tsx`, `src/hooks/useRealtime.tsx`, `src/hooks/useMarkAsReadOnView.ts`

## 2026-02-16 - Docker Compose Build Args from .env

Problem: Local Docker Compose workflow required manually passing build args and could miss theme-related variables.

Root Cause: `docker-compose.dev.yml` only referenced an image tag and had no `build.args` mapping; `Dockerfile` did not inject `NEXT_PUBLIC_UI_SKIN` during build.

Solution: Added `build` configuration in `docker-compose.dev.yml` with args mapped from repo `.env` for `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_REALTIME_URL`, and `NEXT_PUBLIC_UI_SKIN`. Updated `Dockerfile` to accept and write `NEXT_PUBLIC_UI_SKIN` into build-time `.env`.

Result: `docker compose` can now rebuild the frontend image using `.env` values consistently, including UI skin selection.

Files Modified: `docker-compose.dev.yml`, `Dockerfile`
