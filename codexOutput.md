## [2026-02-26 01:24:35 -05:00]

Updated AGENTS.md with the final-response logging rule, and appended this operation summary to codexOutput.md before returning it.

## [2026-02-26 01:51:08 -05:00]

Correct, that behavior was real. The local dedupe entry aged out, and re-scanning old discussion/comment payloads could recreate the mention.

I fixed it by enforcing the 30-day window against the source createdAt when adding mentions. If a mention source is older than 30 days, it is now skipped instead of re-added. I also updated retention pruning to prefer source createdAt (fallback to detectedAt only when needed).

Updated files:

- src/stores/mentionNotificationsStore.ts
- CHANGE_COMMENTS.md

Validation:

- px eslint src/stores/mentionNotificationsStore.ts passed
- px tsc --noEmit passed

## [2026-02-26 01:52:49 -05:00]

Yes. It’s now centralized in src/constants/notifications.constants.ts as MENTION_NOTIFICATION_RETENTION_DAYS (30) and MENTION_NOTIFICATION_RETENTION_MS, and src/stores/mentionNotificationsStore.ts now imports that constant. slint and sc --noEmit both pass.

[2026-02-26 21:46:51]
**Findings Fixed**
1. High: Commit `4ad0959` said it supports international names, but `nameSchema` still used ASCII-only validation (`[a-zA-Z]`), which rejects many valid names.
   Fixed in [src/constants/zod-schema.tsx](C:/Users/Suresh/scicommons/SciCommons-frontend/src/constants/zod-schema.tsx:219), [src/constants/zod-schema.tsx](C:/Users/Suresh/scicommons/SciCommons-frontend/src/constants/zod-schema.tsx:221), and [src/constants/zod-schema.tsx](C:/Users/Suresh/scicommons/SciCommons-frontend/src/constants/zod-schema.tsx:226) with Unicode-aware validation plus `.trim()`.
2. Low: Commit `4ad0959` introduced `ZodSchema<any>` in shared form input typing, which triggered a lint inconsistency (`no-explicit-any`).
   Fixed in [src/components/common/FormInput.tsx](C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/common/FormInput.tsx:13) and [src/components/common/FormInput.tsx](C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/common/FormInput.tsx:49) by switching to `ZodTypeAny`.

**Additional Work**
- Added regression tests for name validation in [src/tests/__tests__/zodSchema.test.ts](C:/Users/Suresh/scicommons/SciCommons-frontend/src/tests/__tests__/zodSchema.test.ts:4) and [src/tests/__tests__/zodSchema.test.ts](C:/Users/Suresh/scicommons/SciCommons-frontend/src/tests/__tests__/zodSchema.test.ts:22).
- Logged this follow-up in [CHANGE_COMMENTS.md](C:/Users/Suresh/scicommons/SciCommons-frontend/CHANGE_COMMENTS.md:1).

**Validation**
- `npx eslint "src/components/common/FormInput.tsx" "src/constants/zod-schema.tsx" "src/tests/__tests__/zodSchema.test.ts"` passed.
- `yarn tsc --noEmit` passed.
- `yarn test --watch=false --runInBand src/tests/__tests__/zodSchema.test.ts` passed (2/2).

Working tree now contains these fixes (not committed yet). I can commit them as one follow-up commit if you want.

