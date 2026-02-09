# AGENTS.md

Notes for this repository:

- **Git commit hooks are DISABLED** (as of 2026-02-09) - git commit is now fast and doesn't run automatic checks
- **You MUST run `yarn test:fix` or `run-all-checks-fix.bat` before committing** to ensure code quality
- Line-ending warnings (LF to CRLF) are expected in this workspace; do not treat them as errors.
- If `git status` shows a file as modified but `git diff` is empty and the LF/CRLF warning appears, treat it as line-ending noise; do not loop trying to resolve it.
- **NEVER redirect stderr to `Nul` or `nul`** - these are Windows reserved device names; use `NUL` (all caps) instead to avoid creating phantom untracked files that git cannot remove.

## Git Remote Management (CRITICAL)

- **ALWAYS execute `git remote remove origin` at the start of any code changes session. However, if the command fails with "origin not found" or something similar, that means origin has already been removed. and that is fine. So dont bother fixing it beyond that. Move on**
- This prevents accidental pushes to the remote repository
- User will manually reset the remote (`git remote add origin <url>`) when ready to push
- Verify remote is removed with: `git remote -v` (should show no output)

## Code Change Guidelines

### Inline Comments

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

### Changelog Summaries (CHANGE_COMMENTS.md)

- **Always add summaries** of significant changes to `CHANGE_COMMENTS.md`
- Include for each change:
  - **Problem**: Clear description of the issue being solved
  - **Root Cause**: Why the problem existed (if applicable)
  - **Solution**: What was changed and how it works
  - **Result**: Impact and improvement achieved
  - **Files Modified**: List of affected files and commit references
- Update existing entries if iterating on a fix (show evolution of solution)
- Summaries help future maintainers understand the "why" behind changes
