## Failure

<!-- Which test(s)/suite(s) were failing, and the key error or assertion. Paste the trimmed
     traceback/diff, not the full raw log. -->

## Root cause

<!-- The mechanism, not the symptom — e.g. "the Vaccination serializer omitted
     booster_due_date, so the frontend rendered undefined for booster dates." -->

## Fix

<!-- What changed and why this addresses the root cause, not just the symptom. -->

## Test evidence

- [ ] Backend (`pytest`): <pass/fail summary>
- [ ] Frontend (`npm run test`): <pass/fail summary>
- [ ] E2E (`npx playwright test`): <pass/fail summary>

<!-- Note any suite that was out of scope for this fix and why. -->

---
Scope: this PR contains only the fix for the failure described above — no additional test
coverage, features, or unrelated refactors.
