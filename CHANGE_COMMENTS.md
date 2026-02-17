## 2026-02-17 - Discussion Comments Toolbar Compaction

Problem: Discussion threads used extra vertical space because the `Comments:` heading and depth/expand controls sat on a separate row below the add-comment control.

Root Cause: `DiscussionComments` rendered the comments title and thread controls in a dedicated block under the add-comment row, creating redundant spacing in both right-panel and full-page discussion contexts.

Solution: Refactored `DiscussionComments` to a single compact toolbar row: kept `Add Comment` on the left, moved `Depth` + `Expand/Collapse All` to the right when comments exist, and removed the superfluous `Comments:` heading.

Result: The discussion comments UI now uses less vertical space while preserving all existing comment-thread controls and behavior.

Files Modified: `src/components/articles/DiscussionComments.tsx`

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
