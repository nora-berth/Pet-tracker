---
name: auto-fix
description: Triage failing tests in Pet Tracker end-to-end — run the relevant test suite(s) (pytest/vitest/playwright), analyze the failure logs to find the root cause, get the user's explicit sign-off on that root cause, implement a fix on a new branch, re-run the full suite to rule out regressions, then get a second explicit sign-off before opening a GitHub PR. Use this whenever the user asks to "fix the failing tests," "figure out why CI/tests are red," "triage this test failure," or reports a specific broken test/spec and wants it root-caused and fixed end-to-end — not just for a one-off "run pytest" or "why did this test fail" question with no intent to ship a fix.
---

# Auto-fix: triage → root cause → fix → publish

This skill runs the full loop for a failing test: reproduce it, explain *why* it's failing, fix
it, prove the fix didn't break anything else, and open a PR — with the user in the loop at the
two moments where their judgment actually matters. It exists because each of those steps is easy
to rush (guessing at a root cause instead of reading the log, "fixing" the symptom instead of the
cause, skipping the regression pass, or opening a PR before anyone's looked at the diff) and
rushing any one of them defeats the point of the exercise on a testing-focused project like this
one.

Read [AGENTS.md](../../../AGENTS.md) before starting — it's the source of truth for commands,
commit style, and the pitfalls below aren't optional flavor, they're this repo's actual known
failure modes (missing venv, missing Django server, silent serializer breakage).

## The two checkpoints are hard stops

There are exactly two points where this skill must pause and get an explicit, unambiguous "go
ahead" from the user before continuing:

1. **After root cause analysis, before touching any code.**
2. **After the fix is implemented and regression-tested, before opening a PR.**

Use `AskUserQuestion` at both points rather than a rhetorical "let me know if this looks good" —
the user should actively confirm, not be left to interrupt if they disagree. Silence or moving on
to the next message is not confirmation. If the user's answer at either checkpoint is "no" or
raises doubt, go back and revise (re-analyze, or keep iterating on the fix) rather than pushing
forward on a technicality. Never merge a PR, never push to `main`, and never force-push — the
skill's job ends at "PR opened," the rest is the user's and CI's call.

## Phase 1 — Scope: which suite(s), and where do the logs come from

Backend (pytest), frontend (Vitest), and E2E (Playwright) are independent suites with different
setup requirements (see AGENTS.md Pitfalls: venv must be active for pytest, the Django dev server
must already be running for Playwright). Figure out scope from context before running anything:

- If the user names a suite, file, or symptom ("the vitest tests are red," "auth.spec.js is
  failing," a pasted pytest traceback), scope to that suite.
- If they paste a CI failure, a PR number, an Actions run link, or say "CI is failing"/"the
  pipeline is red," infer scope from which workflow/job failed (see the CI job map in Phase 2).
- If it's genuinely ambiguous ("tests are failing," no other detail), ask once rather than
  guessing — running the wrong suite wastes a cycle, and running all three unnecessarily is slow
  (E2E in particular takes real setup: Django server, browser install).
- If nothing points to a specific suite, default to running all three locally — that's what
  actually proves nothing else is broken, and matches AGENTS.md's expectation that changes are
  verified at model/API/E2E layers.

Also decide the **source** of the failure, since it changes how Phase 2 gathers logs:

- **Local** — the user ran tests themselves, or gave no indication CI is involved. Run the
  suite(s) directly (default; no extra tooling needed).
- **CI** — the user points at a GitHub Actions run, a failing PR check, or a merge blocked by a
  red pipeline. Pull the actual failure from GitHub via the `gh` CLI rather than guessing at what
  CI saw from a local run — CI can fail for CI-only reasons (env vars, service containers, a flaky
  runner) that never reproduce locally, so working from the real CI log avoids chasing a phantom.
  Confirm `gh auth status` succeeds before relying on it; if not authenticated, ask the user to run
  `gh auth login` rather than falling back to guesswork.

**If the failure lives on an open PR** (the user names a PR, or `gh pr checks` is how you found
it), capture that PR's context now — it changes the target of the fix in Phases 4 and 6:

```bash
gh pr view <pr-number> --json headRefName,headRepositoryOwner,isCrossRepository,maintainerCanModify
```

The fix belongs *on that PR's branch*, not on `main` — the goal is to get the existing PR green,
not to open an unrelated one. Note whether it's cross-repository (a fork): if `maintainerCanModify`
is false on a fork PR, you won't be able to push a branch the author can merge directly — say so
at Checkpoint 1 and ask the user how they want to proceed (comment with the fix as a diff, or open
a fix PR against the fork if you have access) rather than silently falling back to targeting `main`.

Before running pytest: confirm the venv is active (`backend/venv`). Before running Playwright:
confirm the Django dev server is up on :8000 — start it if not (see the `playwright-e2e` skill
for the full E2E setup dance if E2E is in scope; use that skill's conventions if the fix ends up
touching `e2e/`).

## Phase 2 — Get the logs

Keep the raw output for whichever source applies, not just a pass/fail summary — the root-cause
analysis in Phase 3 depends on actual tracebacks/diffs, not on your memory of them.

### Local

```bash
# Backend
cd backend && source venv/bin/activate  # or venv\Scripts\activate on Windows
pytest -v > /tmp/auto-fix-backend.log 2>&1; cat /tmp/auto-fix-backend.log

# Frontend
cd frontend && npm run test > /tmp/auto-fix-frontend.log 2>&1; cat /tmp/auto-fix-frontend.log

# E2E (Django server must already be running)
cd e2e && npx playwright test > /tmp/auto-fix-e2e.log 2>&1; cat /tmp/auto-fix-e2e.log
```

Write logs to a temp directory outside the repo, never into a tracked path — they're
throwaway diagnostic artifacts, not something to accidentally `git add`. If a log is huge (a full
Playwright run with retries), grep for `FAIL`/`Error`/`✘` first, then read surrounding context
rather than dumping the whole thing into the analysis.

### CI (via the `gh` CLI — this is the "GitHub connector")

This repo's workflows map to suites as: `Backend Unit & Integration Tests` and
`API Integration Tests` → backend, `Frontend Unit Tests` → frontend, `E2E Tests` → E2E,
`Build & Test` → the aggregate of all three.

```bash
# Find the failing run — by branch/PR, or just the latest failure on the workflow in question
gh run list --branch <branch> --status failure --limit 5
gh pr checks <pr-number>                     # if working from a PR

# Pull only the failed step output — cheaper and more focused than the full log
gh run view <run-id> --log-failed

# If you need more than the step log (e.g. an uploaded Allure/coverage artifact)
gh run download <run-id> -n <artifact-name>
```

Treat the CI log as authoritative for *what failed on CI*, but still try to reproduce locally
before proposing a fix — a passing local run against a CI-only failure is itself a data point
(points at environment/config, not application logic) worth surfacing in the root cause rather
than skipping past.

## Phase 3 — Root cause analysis

Before diagnosing, rerun the failed test(s) once on their own. A failure that doesn't reproduce is
a flake (timing, test order, shared state) rather than a stable bug or a stably-wrong test —
diagnosing a one-off flake as if it were deterministic leads to a "fix" for something that wasn't
actually broken the way it looked. If it doesn't reproduce, say so and ask whether the user wants
you to investigate the flake itself (still root-cause it — flaky E2E tests are usually a real race
condition, not noise) or drop it.

For each failure that does reproduce, work backward from symptom to cause:

1. What's the exact assertion/error, and which test raised it?
2. What code path does that test exercise? Read it, don't guess from the test name.
3. What changed recently in that path (`git log -p` on the relevant files) that could explain a
   *new* failure, versus a pre-existing/flaky one?
4. State the root cause as a mechanism, not a symptom — "the `Vaccination` serializer doesn't
   include `booster_due_date`, so the frontend renders `undefined`" is a root cause;
   "`test_vaccination_list` fails" is just the symptom restated.
5. If multiple tests fail, check whether they share one root cause before treating them as
   separate problems — a single model/serializer mismatch often cascades into several failing
   tests across layers (AGENTS.md's own pitfall: "Model changes require serializer updates —
   forgetting this breaks the API silently"). If they genuinely don't share a cause, don't bundle
   them: run this whole workflow once per root cause, each with its own Checkpoint 1 and (usually)
   its own branch/PR. A diff fixing two unrelated bugs is exactly the kind of scope creep the
   Scope discipline rule below is about, and it forces the user to approve or reject both fixes as
   a package instead of independently.

If the logs don't give enough to pin down a cause confidently, say so rather than presenting a
guess as fact — dig further (read more of the surrounding code, reproduce narrower) before
reaching the checkpoint.

### Decide where the fix belongs: app code or test code

The root cause points to exactly one of these, and the distinction matters more than it might
seem — the test suite is what proves the app works, so it needs to stay an honest judge of the app,
not be adjusted to agree with whatever the app currently does:

- **The app is wrong, the test is correct** — the test caught a real bug. The fix goes in
  application code (models, views, serializers, components). **Do not touch the test** — not the
  assertion, not the fixture, not the expected value, and don't add new tests either. A test
  failure is only informative because the test wasn't changed to match the bug; editing it to pass
  would erase the exact signal that found the problem, hand back a suite that's green for the
  wrong reason, and leave the real bug live in production. The only touch to a test file that's
  still "the fix" rather than scope creep is the parity AGENTS.md already mandates when a model
  changes — matching serializer and `test_models.py`/`test_api.py` updates so the existing coverage
  still reflects the corrected schema. That's keeping already-required coverage in sync with the
  fix, not adding new coverage — see Scope discipline below for where that line is.
- **The test is wrong, the app is correct** — the test asserts something that isn't actually the
  intended behavior (outdated expectation, wrong fixture data, a flaky/non-deterministic
  assertion). The fix goes in the test file. State plainly in the Checkpoint 1 summary *why* the
  test itself is the thing that's wrong, since "the test was wrong" is a claim that deserves more
  scrutiny than "the app was wrong" — it's the more convenient story if you're motivated to reach
  green quickly, so hold it to a higher bar of evidence before proposing it.
- **Neither is wrong — it's environment/config** (a CI-only failure that doesn't reproduce
  locally, missing service container, stale dependency lock). The fix goes in CI config, fixtures,
  or setup — not in application logic and not in the test's assertions.

Say explicitly at Checkpoint 1 which of these three it is and why, so the user is confirming that
classification along with the root cause itself, not just the mechanism.

### Scope discipline: fix the identified issue, nothing else

This skill's job is to close the gap between "test red" and "test green" for the specific root
cause just confirmed — not to improve the surrounding code while it's already open. Resist the
pull to also:

- Add test coverage beyond what's required to reflect the fix (no new test files, no new cases
  "while we're here," no speculative edge-case tests for behavior that wasn't part of the
  failure). If you think more coverage is genuinely warranted, mention it to the user as a
  follow-up suggestion instead of folding it into this PR.
- Add or extend a feature, even a small one, past what's needed to make the identified failure's
  underlying behavior correct.
- Refactor, rename, or restyle code you're touching for reasons unrelated to the fix.

A tightly-scoped PR is also easier for the user to review at Checkpoint 2 and easier for whoever
merges it to reason about — a diff that mixes "the fix" with "other improvements I noticed" makes
it harder to tell whether the actual fix is correct.

## Checkpoint 1 — confirm the root cause (STOP)

Present, concisely:
- Which test(s) failed and the key error/assertion.
- The root cause, stated as a mechanism.
- Whether the fix belongs in app code, test code, or environment/config (see the classification
  above), and why.
- The fix you intend to make, in one or two sentences (not the full diff yet).

Then ask via `AskUserQuestion` whether to proceed to implementation, revise the analysis, or stop.
Do not write any fix code before this returns a go-ahead.

## Phase 4 — Branch and implement

Once confirmed:

1. `git status` first — if the tree isn't clean, stop and ask rather than branching over
   unrelated in-progress work.
2. Pick the base branch depending on Phase 1's source:
   - **No PR involved** — branch off up-to-date `main`:
     `git checkout main && git pull && git checkout -b <prefix>/<slug>`.
   - **Fixing a failing PR** — branch off *that PR's head branch*, not `main`, so the fix lands on
     top of the PR's own commits: `git fetch origin <pr-headRefName> && git checkout -b
     <prefix>/<slug> origin/<pr-headRefName>`. Fixing the symptom on `main` instead would produce a
     PR that doesn't actually make the original one mergeable.
   
   Pick the prefix the same way AGENTS.md picks commit types — `fix/` for an actual bug in
   application code, `test/` if the root cause turns out to be a wrong or flaky test rather than a
   product bug, `refactor/` only if the fix is a structural cause with no behavior change.
3. Make the minimal change that addresses the root cause — not the smallest change that makes the
   red test green. A fix that special-cases the failing input instead of correcting the mechanism
   satisfies the letter of "tests pass" while leaving the actual bug in place. If Checkpoint 1
   classified this as an app-code bug, that also means the failing test itself is off-limits —
   changing it is how a real bug quietly turns into a "passing" suite. If the confirmed
   classification was test code or environment/config instead, make the change there and leave
   application code alone. See Scope discipline above — this is a fix, not an opportunity to add
   tests, features, or unrelated cleanup.
4. Match the codebase you're editing, not a generic default: look at the neighboring code in the
   file/module you're changing (naming, error handling, how similar cases are already written
   elsewhere in the app) and follow AGENTS.md's architecture notes (DRF ViewSets + serializers on
   the backend, API calls routed through `frontend/src/services/api.js` on the frontend, etc.). A
   correct fix that's written in a style foreign to the surrounding code still costs the reviewer
   time and reads as a graft rather than a natural change.
5. If the change touches a model, update the serializer in the same pass, and update
   `test_models.py`/`test_api.py` only enough to match the corrected schema/behavior — this is
   AGENTS.md's mandatory parity rule (skipping it breaks the API silently), not new test coverage,
   so don't use it as license to expand those files beyond what the fix requires.
6. Never leave a test skipped (`pytest.mark.skip`) or commented out to get to green — if a test is
   genuinely wrong, fix or replace it with one that correctly encodes the intended behavior; don't
   silence it.

## Phase 5 — Regression pass

Re-run *every* suite that was in scope in Phase 1 (not just the one that originally failed) — a
serializer or model fix in particular tends to have blast radius across layers. If the fix touched
any frontend code, also run `npm run lint` (from `frontend/`) — a fix that passes tests but fails
the repo's own linter isn't following AGENTS.md's coding conventions, and that's cheap to catch
now versus at CI/review time. If new failures show up:

- If they're caused by the fix itself, keep iterating within this phase — no need to re-trigger
  Checkpoint 1 for implementation adjustments that are still executing the confirmed root cause.
- If the regression pass reveals the root cause analysis itself was wrong or incomplete (the fix
  doesn't actually hold up), stop and go back to Checkpoint 1 with the corrected analysis rather
  than papering over it.

Don't proceed to Checkpoint 2 while anything in scope is still red.

## Checkpoint 2 — confirm before publishing (STOP)

Present, concisely:
- The diff (or a summary of files changed, for a large diff).
- Confirmation that the full in-scope suite is green.
- The commit message and branch name you intend to use.
- The PR's base branch — call this out explicitly when it's a PR's head branch rather than `main`,
  so the user isn't surprised by where the fix is headed.

Then ask via `AskUserQuestion` whether to open the PR, make further changes first, or stop here
(leaving the branch local/unpublished). Do not push or open a PR before this returns a go-ahead.

## Phase 6 — Publish

Once confirmed:

1. Commit with a conventional-commit message (`fix:`/`test:`/`refactor:` matching the branch
   prefix), describing *why*, not a restatement of the diff.
2. Push the branch (`git push -u origin <branch>`) — never `main`, never `--force`.
3. Open the PR with `gh pr create`, setting `--base` to match Phase 4's choice:
   - No PR involved → `--base main` (the default).
   - Fixing a failing PR → `--base <pr-headRefName>`, so this PR merges *into* the failing PR's
     branch rather than into `main`. Reference the original PR number in the description (e.g.
     "Fixes the failing `E2E Tests` check on #123") so the connection is visible to both PRs'
     reviewers, and mention it to the user when reporting the URL — this PR is a stepping stone
     that needs merging into #123 before #123 itself is mergeable, not a replacement for it.
   
   Use `assets/pr_description.md` as the template either way — fill in the failure, root cause,
   and fix sections from Phases 2–4 so a reviewer gets the same narrative the user already
   confirmed, without re-deriving it from the diff.
4. Report the PR URL back to the user. Do not merge it, and don't represent CI as having passed
   until it actually has — this skill's regression pass in Phase 5 is local, not a substitute for
   the repo's real CI/CD pipeline that AGENTS.md requires to pass before merging. Once pushed, you
   can watch the PR's checks with `gh pr checks <pr-number> --watch` and update the test-evidence
   section with the real CI result — this matters most when the original failure was CI-sourced,
   since that's the only way to confirm the fix actually holds up in the environment it broke in,
   not just locally.

## Reference files

- `assets/pr_description.md` — PR body template (failure / root cause / fix / test evidence)
