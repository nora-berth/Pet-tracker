# Pet Tracker - My app + QA Project

[![codecov](https://codecov.io/gh/nora-berth/pet-tracker/graph/badge.svg)](https://codecov.io/gh/nora-berth/pet-tracker)
[![Build & Test](https://github.com/nora-berth/pet-tracker/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/nora-berth/Pet-tracker/actions/workflows/build-and-test.yml)


A pet health management application, including multi-layer test automation, CI/CD pipeline, and test reporting.
Still a work in progress. Check out the [SETUP.md](SETUP.md) guide for detailed installation and configuration instructions.


## CI/CD Pipeline

On every push and PR to `main`, four test layers run in parallel:

- **Backend** (pytest) | **Frontend** (Vitest) | **E2E** (Playwright) | **API** (Newman)

The **Build & Test** gate job requires all four to pass before the pipeline is green. Code coverage is enforced at a minimum of 90% via Codecov. After a successful `main` build, a separate workflow generates and deploys E2E Allure and API Newman reports to GitHub Pages with trend history.

[Pipeline](https://github.com/nora-berth/Pet-tracker/actions) | [E2E Allure Report](https://nora-berth.github.io/Pet-tracker/allure/) | [API Newman Report](https://nora-berth.github.io/Pet-tracker/newman/)


## Tech Stack

### Application
- **Backend**: Django + Django REST Framework
- **Frontend**: React + Vite + React Router
- **Database**: PostgreSQL (Docker)
- **Authentication**: DRF Token Authentication
- **API**: RESTful

### Testing & QA
- **Backend Testing**: Pytest
- **Frontend Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Postman + Newman (CI)
- **Test Reporting**: Allure (for E2E) and Newman htmlextra (for API), both deployed to GitHub Pages
- **CI/CD**: GitHub Actions


## Project Structure

```
pet-tracker/
├── .github/workflows/
│   ├── frontend-tests.yml
│   ├── backend-tests.yml
│   ├── e2e-tests.yml
│   ├── api-tests.yml
│   ├── build-and-test.yml
│   └── deploy-allure-pages.yml
├── backend/
│   ├── config/
│   ├── pets/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── tests/
│   │       ├── test_models.py
│   │       ├── test_api.py
│   │       └── test_auth_api.py
│   ├── postman/
│   │   ├── Pet Tracker API.postman_collection.json
│   │   ├── Local Development.postman_environment.json
│   │   └── README.md
│   ├── pytest.ini
│   ├── requirements.txt
│   └── manage.py
├── e2e/
│   ├── package.json
│   ├── playwright.config.js
│   ├── tests/
│   │   ├── pet-management.spec.js
│   │   └── auth.spec.js
│   ├── pages/
│   │   ├── login.page.js
│   │   ├── signup.page.js
│   │   ├── home.page.js
│   │   ├── pet-detail.page.js
│   │   └── nav.component.js
│   ├── fixtures/
│   │   ├── pet-fixtures.js
│   │   └── auth-fixtures.js
│   └── helpers/
│       └── api-helpers.js
├── frontend/
│   ├── src/
│   │   ├── App.test.jsx
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Login.test.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   ├── Signup.test.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/
│   │   │       └── Navbar.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── test/
│   │       └── setup.js
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
├── CLAUDE.md
├── README.md
└── SETUP.md
```


## Contact

**Nora Bertholome** - QA Engineer

GitHub: [@nora-berth](https://github.com/nora-berth)


**Built with ❤️ for my pets and as my personal QA project**
