# Pet Tracker - My app + QA Project

[![codecov](https://codecov.io/gh/nora-berth/pet-tracker/graph/badge.svg)](https://codecov.io/gh/nora-berth/pet-tracker)
![Backend Tests](https://github.com/nora-berth/pet-tracker/actions/workflows/backend-tests.yml/badge.svg)
![Frontend Tests](https://github.com/nora-berth/pet-tracker/actions/workflows/frontend-tests.yml/badge.svg)
![E2E Tests](https://github.com/nora-berth/pet-tracker/actions/workflows/e2e-tests.yml/badge.svg)
![API Tests](https://github.com/nora-berth/pet-tracker/actions/workflows/api-tests.yml/badge.svg)


A pet health management application, including multi-layer test automation, CI/CD pipeline, and test reporting.
Still a work in progress. Check out the [SETUP.md](SETUP.md) guide for detailed installation and configuration instructions.


## CI/CD Pipeline

[Pipeline](https://github.com/nora-berth/Pet-tracker/actions)

[E2E Allure Report](https://nora-berth.github.io/Pet-tracker/)


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
- **Test Reporting**: Allure (for E2E, deployed to GitHub Pages), Newman htmlextra (for API tests)
- **CI/CD**: GitHub Actions


## Project Structure

```
pet-tracker/
├── .github/workflows/
│   ├── frontend-tests.yml
│   ├── backend-tests.yml
│   ├── e2e-tests.yml
│   ├── api-tests.yml
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
├── frontend/
│   ├── e2e/
│   │   ├── pet-management.spec.js
│   │   ├── auth.spec.js
│   │   ├── fixtures/
│   │   │   ├── pet-fixtures.js
│   │   │   └── auth-fixtures.js
│   │   └── helpers/
│   │       └── api-helpers.js
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
│   ├── playwright.config.js
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
