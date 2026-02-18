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
