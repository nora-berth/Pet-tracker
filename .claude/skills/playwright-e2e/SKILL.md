---
name: playwright-e2e
description: Write, extend, or run Playwright end-to-end tests for the Pet Tracker app's e2e/ directory. Use this whenever the task involves E2E tests, UI/browser test coverage, a Playwright spec file, a page object under e2e/pages/, test fixtures under e2e/fixtures/, Allure reporting/severity, or running `npx playwright test`. Trigger even if the user just says "add a test for X" or "cover this flow" without naming Playwright explicitly, as long as the flow is a browser/UI flow.
---

# Playwright E2E tests (Pet Tracker)

This skill encodes how E2E tests are written in this repo's `e2e/` directory: Page Object
Model, Allure reporting, accessibility-first selectors, and fixture-based test data.

Read this whole file before writing a test — the conventions interlock (fixtures feed page
objects, page objects feed specs, specs drive Allure output) and skipping one breaks the others.

## Before you start: run the app

Playwright's `webServer` config in `e2e/playwright.config.js` auto-starts the frontend
(`npm run dev --prefix ../frontend`) if it isn't already running, but it does **not** start the
Django backend. E2E tests talk to the real API (fixtures create/delete data via
`e2e/helpers/api-helpers.js`), so **the Django dev server must already be running** before you
run tests:

```bash
cd backend
# activate venv first (source venv/bin/activate, or venv\Scripts\activate on Windows)
python manage.py runserver   # http://localhost:8000
```

Then from `e2e/`:

```bash
cd e2e
npx playwright test                    # headless, all browsers configured in playwright.config.js
npx playwright test --headed           # watch it run
npx playwright test tests/auth.spec.js # one file
npx playwright test -g "add a new pet" # by test name
```

If a run fails with connection-refused errors on port 8000, that's almost always the missing
Django server, not a real bug — check that first.

## Directory map

```
e2e/
├── tests/          spec files — *.spec.js
├── pages/          Page Object classes — one per route
├── fixtures/        Playwright test fixtures — test data setup/teardown
├── helpers/         api-helpers.js — direct API calls used by fixtures (create/delete via REST, bypassing the UI)
└── playwright.config.js
```

## The four rules, in order

Every new or updated test should satisfy all four. They compound: a selector rule violation in
a page object undermines the Allure narrative, a missing fixture leads to manual cleanup, etc.

### 1. Page Object Model — page objects own locators and actions, tests own assertions

- One class per route, in `e2e/pages/`, named `<Route>Page` in `<route>.page.js`
  (e.g. `HomePage` in `home.page.js`, `PetDetailPage` in `pet-detail.page.js`). A nav bar shared
  across authenticated pages lives separately as `NavComponent` in `nav.component.js` — model any
  other cross-page shared UI the same way rather than duplicating locators per page.
- **All locators are defined in the constructor**, never inline inside a method:
  - Static locators are plain properties: `this.deleteButton = page.getByRole('button', { name: 'Delete Pet' });`
  - Dynamic locators (parameterized by data) are arrow functions:
    `this.petNameHeading = (petName) => page.getByRole('heading', { name: petName, level: 1 });`
- Methods on the class perform actions (`goto()`, `addPet({...})`, `deletePet()`) — multi-field
  forms take a single options object so callers can omit fields they don't care about (see
  `addWeightRecord` in `pet-detail.page.js` for the pattern: fill required fields, `if (x !==
  undefined) await field.fill(x)` for optional ones).
- **Page objects never call `expect()`.** They return locators (as properties or via a getter/
  arrow function); the spec file does every assertion. This keeps one place responsible for
  "what happened" (page object) and one place responsible for "was that correct" (test).
- Reuse existing page objects before writing a new one — check `e2e/pages/` first. Add methods
  to an existing class rather than duplicating a page object for the same route.

See `assets/page-object.template.js` for a skeleton, and `e2e/pages/pet-detail.page.js` in this
repo for a fully worked example with static locators, dynamic locators, and multi-field forms.

### 2. Selectors — accessibility selectors over CSS

Prefer, in this order: `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`. These mirror
how a real user or assistive technology finds the element, and they don't break when class names
or DOM structure change. Reach for a CSS locator (`page.locator('p.breed')`) only when there is
no accessible way to distinguish the element — and treat that as a signal the markup might be
missing a label or role, worth a note if you're also touching the frontend.

### 3. Fixtures — test data comes from fixtures, never from manual cleanup in the test body

- Test data setup/teardown lives in `e2e/fixtures/`, built with Playwright's `test.extend()`.
  `pet-fixtures.js` extends `auth-fixtures.js`, so a spec importing `test`/`expect` from
  `pet-fixtures.js` gets `testUser`, `authenticatedPage`, and `testPet` together.
- A fixture creates its data via direct API calls (`e2e/helpers/api-helpers.js`,
  `createPetViaAPI` / `deletePetViaAPI` / `deleteAllPetsViaAPI`) — not through the UI — so test
  setup is fast and isolated from the UI flow under test. Teardown runs after `use()` returns,
  wrapped in try/catch so a cleanup failure doesn't fail the test itself.
- **Never delete/reset data inside the test body.** If a test needs a pet, cat, or other record
  that doesn't already have a fixture, add one to `pet-fixtures.js` (or a new fixtures file for a
  new domain) following the create-via-API / `use()` / delete-via-API shape — don't inline
  creation-and-cleanup in the spec.
- If an existing fixture almost fits but needs a variant (e.g. a pet with vaccinations already
  attached), extend the fixture file with a new named fixture rather than mutating the shared one
  or hand-rolling setup in the test.

See `assets/spec.template.js` and `e2e/fixtures/pet-fixtures.js`.

### 4. Allure reporting — every test tells a story

Allure output is E2E-only in this repo (unit and API tests don't produce it) and deploys to
GitHub Pages in CI, so a test with thin or missing Allure metadata shows up as a blank spot in
that report. Every test needs:

- `allure.epic(...)` — usually set once per `describe` block in `beforeEach` (e.g. `'Pet
  Tracker'`), not per test.
- `allure.feature(...)` and `allure.story(...)` — set per test, naming the feature area and the
  specific scenario.
- `allure.severity(Severity.X)` — set per test. Use:
  - `Severity.BLOCKER` for a complete critical user journey (e.g. the full add → view → edit →
    delete flow) — reserve this for tests whose failure means the app is fundamentally broken,
    not just one feature.
  - `Severity.CRITICAL` for a single core flow (view home page, add a pet, delete a pet).
  - `Severity.NORMAL` for secondary features (adding a weight record, adding a photo).
  - Don't default everything to CRITICAL/BLOCKER — an Allure report where every test is the top
    severity stops being useful for triage.
- `test.step('...')` wrapping each logical phase of the test (navigate, fill form, verify) —
  this is what makes the Allure report readable as a narrative rather than a flat pass/fail. Keep
  step descriptions in plain, present-tense language a non-engineer reading the report could
  follow ("Add weight record", not "call addWeightRecord()").

Import pattern used throughout this repo (keep it consistent — a past PR unified these imports,
see git history on `auth.spec.js`):

```js
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
```

## Checklist before you consider a test done

- [ ] Django dev server was running while the test was executed (not just written)
- [ ] `npx playwright test <your file>` passes locally
- [ ] Locators added/used are `getByRole`/`getByLabel`/`getByText` unless there's no accessible
      alternative
- [ ] All locators live in the page object constructor (static as properties, dynamic as arrow
      functions) — none inline in a method
- [ ] No `expect()` calls inside a page object file
- [ ] Test data comes from a fixture with automatic cleanup — nothing deleted/reset in the test
      body
- [ ] `allure.epic/feature/story/severity` are set, and severity reflects actual criticality
- [ ] Each logical phase of the test is wrapped in `test.step(...)`

## Reference files

- `assets/page-object.template.js` — starting skeleton for a new page object
- `assets/spec.template.js` — starting skeleton for a new spec file wired to fixtures + Allure
- Real, worked examples in this repo: `e2e/pages/pet-detail.page.js`, `e2e/fixtures/pet-fixtures.js`,
  `e2e/tests/pet-management.spec.js`
