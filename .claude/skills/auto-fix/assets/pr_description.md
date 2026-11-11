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

<!-- Unattended runs only. Delete this section for interactive runs. -->
## Opened unattended

This PR was opened by the `auto-fix` skill running with `--unattended`. No human confirmed the
root cause or reviewed the diff before it was opened. Classification: <app code / test code /
environment>. <If draft: "Opened as a draft because the fix changes tests/config rather than
app code. Please check the classification before marking it ready.">

---
Scope: this PR contains only the fix for the failure described above — no additional test
coverage, features, or unrelated refactors.
