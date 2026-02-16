# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pet Tracker is a full-stack web application for managing pet health records. It tracks pets, weight records, vaccinations, and vet visits.

**Important Context:**
- This is a QA portfolio project - testing quality is paramount
- All new features MUST include tests at multiple layers (model, API, E2E)
- CI/CD pipeline must pass before merging to main
- Allure reports are used for E2E tests only and deployed to GitHub Pages
- Test coverage and quality demonstrate professional QA engineering skills

## Environment Requirements

- **Python**: 3.11+ with venv
- **Node**: 20+
- **Docker Desktop**: For PostgreSQL container
- **Allure CLI**: For local report viewing (optional)
- **Operating System**: Windows (venv activation uses `venv\Scripts\activate`)

## Development Commands

### Database
```bash
docker-compose up -d  # Start PostgreSQL database
```

### Backend (Django REST Framework)
```bash
cd backend
venv\Scripts\activate  # Windows (or source venv/bin/activate on Mac/Linux)
python manage.py runserver  # Runs on http://localhost:8000
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py shell             # Django shell for testing
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev    # Runs on http://localhost:5173
npm run build
npm run lint
```

### Testing
```bash
# Backend tests (pytest with Django)
cd backend
venv\Scripts\activate
pytest                              # Run all tests
pytest pets/tests/test_models.py    # Run specific test file
pytest pets/tests/test_api.py       # Run API tests
pytest -k "test_name"               # Run test by name
pytest --cov=pets --cov-report=term # Run with coverage report
pytest --cov=pets --cov-report=html # Generate HTML coverage report

# Frontend unit tests (Vitest)
cd frontend
npm run test     # Run tests
npm run test:ui  # Run tests with UI

# E2E tests (Playwright)
cd frontend
npx playwright test                 # Run all E2E tests
npx playwright test --headed        # Run with browser visible
npx playwright test --debug         # Run in debug mode
npx playwright show-report          # View HTML report

# API tests (Postman/Newman)
npm install -g newman newman-reporter-htmlextra  # Install Newman (one-time)
newman run "backend/postman/Pet Tracker API.postman_collection.json" \
  -e "backend/postman/Local Development.postman_environment.json"  # Run collection
newman run "backend/postman/Pet Tracker API.postman_collection.json" \
  -e "backend/postman/Local Development.postman_environment.json" \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export newman-report.html  # Run with HTML report
```

## Architecture

### Backend (`backend/`)
- **Django project**: `config/` contains settings, root URLs, WSGI/ASGI config
- **Pets app**: `pets/` - single Django app containing all models, views, serializers
- **API**: REST API using Django REST Framework with ViewSets and a DefaultRouter
- **Database**: PostgreSQL (configured in docker-compose.yml, runs on port 5432)

### Frontend (`frontend/`)
- **React 19** with Vite and React Router
- **Components**: All pet-related components in `src/components/pets/`
- **API client**: `src/services/api.js` - axios-based client for all API calls

### API Endpoints (all under `/api/`)
- `/api/pets/` - CRUD for pets
- `/api/weight-records/` - Weight tracking (filterable by `?pet=<id>`)
- `/api/vaccinations/` - Vaccination records (filterable by `?pet=<id>`)
- `/api/vet-visits/` - Vet visit records (filterable by `?pet=<id>`)

### Data Models
- **Pet**: Core entity with species choices (dog, cat, ferret, tortoise, rabbit, bird, hamster, guinea_pig, snake, other)
- **WeightRecord**: Linked to Pet, tracks weight over time with kg/lb units
- **Vaccination**: Linked to Pet, tracks vaccines with due dates
- **VetVisit**: Linked to Pet, tracks vet appointments with costs

## Testing Structure

### Test File Locations
- **Backend tests**: `backend/pets/tests/`
  - `test_models.py` - model layer tests (Pet, WeightRecord, Vaccination, VetVisit)
  - `test_api.py` - API tests covering CRUD operations, validation, error handling
- **API tests (Postman)**: `backend/postman/`
  - `Pet Tracker API.postman_collection.json` - Postman collection with test scripts
  - `Local Development.postman_environment.json` - Environment variables for local/CI
- **Frontend unit tests**: `frontend/src/App.test.jsx`
- **E2E tests**: `frontend/e2e/`
  - `pet-management.spec.js` - E2E user journey tests
  - `fixtures/pet-fixtures.js` - Test data fixtures with automatic cleanup
  - `helpers/api-helpers.js` - API utilities for test setup

### Test Reporting
- **Allure Framework** is used for E2E tests only
- E2E Allure reports are automatically generated in CI and deployed to GitHub Pages
- **Newman htmlextra** generates HTML reports for Postman API tests in CI
- Newman CI results are also shown in GitHub Step Summary
- Backend and frontend unit tests report via native pytest and Vitest output

## Key File Relationships

Understanding how files interact helps maintain the codebase:

### Backend Flow
1. `backend/pets/models.py` - Defines data models (Pet, WeightRecord, Vaccination, VetVisit)
2. `backend/pets/serializers.py` - Serializes models for API (includes nested relationships)
3. `backend/pets/views.py` - Defines ViewSets for REST endpoints (handles CRUD operations)
4. `backend/pets/urls.py` - Registers ViewSets with DefaultRouter
5. `config/urls.py` - Includes pets URLs under `/api/`

**Important**: Changes to models require updating serializers and may need new tests in both `test_models.py` and `test_api.py`

### Frontend Flow
1. `frontend/src/services/api.js` - Axios-based API client (all backend calls go through here)
2. `frontend/src/components/pets/` - React components for pet management UI
3. `frontend/src/pages/` - Page-level components using React Router
4. `frontend/src/App.jsx` - Main app component with routing

### Test Flow
1. **Backend tests** directly test models and API endpoints
2. **Frontend unit tests** mock API calls using `vi.spyOn()`
3. **E2E tests** use `helpers/api-helpers.js` to set up test data via API
4. **E2E fixtures** (`fixtures/pet-fixtures.js`) automatically create/cleanup test pets

## Coding Practices

### When Writing Tests

**Backend Tests (pytest)**
- Follow AAA pattern (Arrange-Act-Assert) with clear comments
- Use descriptive test names: `test_<function>_<scenario>` (e.g., `test_pet_create_with_required_fields`)
- Mark database tests with `@pytest.mark.django_db`
- Test both success cases AND error cases (404, 400, validation errors)
- Verify database state after API calls, not just response status

**Frontend Unit Tests (Vitest)**
- Mock API calls using `vi.spyOn(api.moduleAPI, 'method').mockResolvedValue()`
- Test user-visible behavior, not implementation details

**E2E Tests (Playwright)**
- Use fixtures for test data that needs automatic cleanup
- Use `test.step()` for narrative test reporting
- Always include Allure severity annotations (BLOCKER for critical paths)
- Use accessibility selectors (role, label, text) over CSS selectors
- Clean up test data in fixtures, not in test body

### API Development

- All API endpoints use ViewSets with DefaultRouter
- Serializers use nested relationships for related records (pets include weight_records, vaccinations, vet_visits)
- Foreign key relationships use CASCADE delete (deleting a pet removes all its records)
- Filter querysets by pet ID using `?pet=<id>` query parameter
- Always return proper HTTP status codes (200, 201, 204, 400, 404)

### Database Migrations

- Always activate venv before running `makemigrations` or `migrate`
- Test migrations on a fresh database before committing
- Update serializers if model fields change
- Add corresponding tests for new fields or models

## Common Pitfalls to Avoid

- ❌ **DON'T** create migrations without activating venv first
- ❌ **DON'T** run E2E tests without starting Django server (`python manage.py runserver`)
- ❌ **DON'T** commit code without running tests locally
- ❌ **DON'T** modify database schema without updating serializers and tests
- ❌ **DON'T** add new features without tests at multiple layers
- ❌ **DON'T** use `pytest.mark.skip` without a good reason and issue reference
- ❌ **DON'T** commit with failing tests or commented-out tests
- ❌ **DON'T** forget to add Allure annotations to new E2E tests