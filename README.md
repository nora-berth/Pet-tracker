# Pet Tracker - My app + QA Project

[![CI Pipeline](https://github.com/nora-berth/pet-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/nora-berth/pet-tracker/actions)
[![Test Reports](https://img.shields.io/badge/Test%20Reports-Allure-green)](https://nora-berth.github.io/pet-tracker/)

A pet health management application including multi-layer test automation, CI/CD pipeline, and test reporting.
Still a work in progress. Check out the [SETUP.md](SETUP.md) guide for detailed installation and configuration instructions.


## Test Reports

**[Live Test Reports with Allure](https://nora-berth.github.io/pet-tracker/)** - Auto-generated from latest CI run

The reports include:
- Test execution history and trends
- Severity-based test categorization (BLOCKER, CRITICAL, NORMAL, TRIVIAL)
- Test hierarchy (Epic → Feature → Story)
- Detailed test steps
- Coverage across backend, frontend, and E2E tests


## Test Architecture

### Backend Tests
**Location**: `backend/pets/tests/`

- **Framework**: Pytest with Django integration
- **Test Files**:
  - [test_models.py](backend/pets/tests/test_models.py) - Model layer validation (Pet, WeightRecord, Vaccination, VetVisit)
  - [test_api.py](backend/pets/tests/test_api.py) - REST API CRUD operations, error handling, validation

### Frontend Tests
**Location**: `frontend/src/`

- **Framework**: Vitest + React Testing Library
- **Test Files**:
  - [App.test.jsx](frontend/src/App.test.jsx) - Component tests

### End-to-End Tests
**Location**: `frontend/e2e/`

- **Framework**: Playwright
- **Test Files**:
  - [pet-management.spec.js](frontend/e2e/pet-management.spec.js) - Critical user paths
  - [fixtures/pet-fixtures.js](frontend/e2e/fixtures/pet-fixtures.js) - Test data management
  - [helpers/api-helpers.js](frontend/e2e/helpers/api-helpers.js) - API utilities for test setup


## CI/CD Pipeline

**Pipeline**: [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Pipeline Architecture

```mermaid
graph LR
    A[Backend Tests] --> D[E2E Tests]
    B[Frontend Tests] --> D
    D --> E[Generate Reports]
    E --> F[Deploy to GitHub Pages]
```

#### Job 1: Backend Tests
- Python 3.11 + pytest
- PostgreSQL 16 service with health checks
- Coverage reporting (XML + terminal)
- Allure results artifact

#### Job 2: Frontend Unit Tests
- Node 20 + Vitest
- Unit test execution
- Allure results artifact

#### Job 3: E2E Tests
- Full environment setup (Python + Node + PostgreSQL)
- Database migrations
- Django development server
- Playwright browser installation
- HTML report + Allure results

#### Job 4: Generate Reports
- Runs on success/failure
- Allure CLI 2.25.0 aggregates all test results
- Combined HTML report generation

#### Job 5: Deploy to GitHub Pages
- Deployment for main branch reports
- GitHub Pages integration
- Public test report hosting


## Tech Stack

### Application
- **Backend**: Django + Django REST Framework
- **Frontend**: React + Vite + React Router
- **Database**: PostgreSQL (Docker)
- **API**: RESTful with ViewSets and nested serializers

### Testing & QA
- **Backend Testing**: Pytest + Pytest-Django + Pytest-cov
- **Frontend Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Test Reporting**: Allure (with Pytest, Vitest, Playwright integrations)
- **CI/CD**: GitHub Actions with multi-job workflow


## Project Structure

```
pet-tracker/
├── .github/workflows/
│   └── ci.yml                          # 5-job CI/CD pipeline
├── backend/
│   ├── config/                         # Django settings, URLs
│   ├── pets/
│   │   ├── models.py                   # 4 data models (Pet, WeightRecord, Vaccination, VetVisit)
│   │   ├── views.py                    # 4 ViewSets with REST API
│   │   ├── serializers.py              # DRF serializers with nested relationships
│   │   └── tests/
│   │       ├── test_models.py          # 17 model tests
│   │       └── test_api.py             # 20+ API test classes
│   ├── pytest.ini                      # Pytest configuration + Allure settings
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── e2e/
│   │   ├── pet-management.spec.js      # 6 E2E tests (257 lines)
│   │   ├── fixtures/
│   │   │   └── pet-fixtures.js         # Test data fixtures with cleanup
│   │   └── helpers/
│   │       └── api-helpers.js          # API utilities for test setup
│   ├── src/
│   │   ├── App.test.jsx                # Component unit tests
│   │   ├── components/                 # React components
│   │   ├── pages/                      # Page components
│   │   ├── services/                   # API client (axios)
│   │   └── test/
│   │       ├── setup.js                # Vitest global setup
│   │       └── allure-helpers.js       # Allure annotation helpers
│   ├── playwright.config.js            # Playwright configuration
│   ├── vite.config.js                  # Vite + Vitest + Allure reporter
│   └── package.json
├── docker-compose.yml                  # PostgreSQL 16 service
├── CLAUDE.md                           # Development documentation
├── README.md
└── SETUP.md
```


## 🤝 Contact

**Nora Bertholome** - QA Engineer

GitHub: [@nora-berth](https://github.com/nora-berth)


**Built with ❤️ for my pets and as my personal QA project**
