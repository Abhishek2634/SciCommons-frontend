# AGENTS.md

Notes for this repository:
- Git commit commands may appear to time out due to hooks, but the commit often completes; verify with `git log -1 --oneline` and `git status -sb`.
- Line-ending warnings (LF to CRLF) are expected in this workspace; do not treat them as errors.

## Code Change Guidelines
- **Always add explanatory comments** to non-trivial code changes
- Comments should include:
  - **Who**: Fixed by [Agent/Person Name] on [Date]
  - **What**: Brief description of what was changed
  - **Why**: Problem being solved or reason for change (if not obvious)
  - **How**: New approach or key implementation details
- Example format:
  ```typescript
  /* Fixed by Claude Sonnet 4.5 on 2026-02-08
     Problem: Link extended full width causing UX issues
     Solution: Changed to inline-flex to only wrap title text
     Result: Link cursor only appears over actual content */
  ```
