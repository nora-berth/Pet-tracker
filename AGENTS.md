# AGENTS.md

Pet Tracker is a full-stack Django + React app for managing pet health records (pets, weight, vaccinations, vet visits). This is a QA portfolio project — testing quality is paramount.

This is the source of truth for project conventions, for any coding agent.

## Rules

- Every new feature MUST include tests at model, API, and E2E layers
- Run `pytest` in `backend/` before committing any backend changes
- Run `npm run test` in `frontend/` before committing any frontend changes
- Never commit with failing or commented-out tests
- Never use `pytest.mark.skip` without a linked issue explaining why
- Never modify migration files directly — always use `makemigrations`
- When changing models, also update serializers and add tests in both `test_models.py` and `test_api.py`
- CI/CD pipeline must pass before merging to main
- Use conventional commit style: `feat:`, `fix:`, `test:`, `ci:`, `docs:`, `refactor:`

## Commands

```bash
# Database
docker-compose up -d

# Backend (always activate venv first)
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver           # http://localhost:8000
python manage.py makemigrations && python manage.py migrate
pytest                               # all backend tests
pytest --cov=pets --cov-report=term  # with coverage

# Frontend
cd frontend
npm run dev       # http://localhost:5173
npm run test      # Vitest unit tests
npm run lint

# E2E (requires backend running)
cd e2e
npx playwright test
npx playwright test --headed   # with browser visible

# API tests (Newman/Postman)
newman run "backend/postman/Pet Tracker API.postman_collection.json" \
  -e "backend/postman/Local Development.postman_environment.json"
```

## Test Conventions

### Backend (pytest)
- Follow AAA pattern (Arrange-Act-Assert) with clear comments
- Name tests `test_<function>_<scenario>` (e.g., `test_pet_create_with_required_fields`)
- Mark all database tests with `@pytest.mark.django_db`
- Test both success and error cases (404, 400, validation errors)
- Verify database state after API calls, not just response status
- Test files: `backend/pets/tests/test_models.py`, `backend/pets/tests/test_api.py`

### Frontend Unit (Vitest)
- Mock API calls using `vi.spyOn(api.moduleAPI, 'method').mockResolvedValue()`
- Test user-visible behavior, not implementation details

### E2E (Playwright)
- Full conventions — Page Object Model, selector rules, fixture/cleanup patterns, and Allure
  annotation rules — live in [`.claude/skills/playwright-e2e/SKILL.md`](.claude/skills/playwright-e2e/SKILL.md).
  Read it before writing or editing any E2E test. It also carries page-object/spec templates under
  `.claude/skills/playwright-e2e/assets/`.
- Allure reports are for E2E only and deploy to GitHub Pages in CI

### API Tests (Postman/Newman)
- Collection: `backend/postman/Pet Tracker API.postman_collection.json`
- Environment: `backend/postman/Local Development.postman_environment.json`
- Newman htmlextra generates HTML reports in CI; results also appear in GitHub Step Summary

## Key Architecture Decisions

- Backend: single Django app (`pets/`) with DRF ViewSets + DefaultRouter, all endpoints under `/api/`
- Serializers use nested relationships (pets include weight_records, vaccinations, vet_visits)
- Foreign keys use CASCADE delete — deleting a pet removes all its records
- Related records are filterable by `?pet=<id>`
- Frontend: React 19 + Vite + React Router; all API calls go through `frontend/src/services/api.js`

## Pitfalls

- E2E tests require the Django dev server to be running first
- Activate venv before any `manage.py` or `pytest` command
- Model changes require serializer updates — forgetting this breaks the API silently
