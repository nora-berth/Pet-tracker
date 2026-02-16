# Pet Tracker - My app + QA Project


A pet health management application including multi-layer test automation, CI/CD pipeline, and test reporting.
Still a work in progress. Check out the [SETUP.md](SETUP.md) guide for detailed installation and configuration instructions.


## CI/CD Pipeline

[Pipeline](https://github.com/nora-berth/Pet-tracker/actions)

[E2E Allure Report](https://nora-berth.github.io/pet-tracker/)

### Pipeline Architecture

```mermaid
graph TB
    A[Frontend Tests Workflow] -->|Vitest native output| A1[CI pass/fail status]
    B[Backend Tests Workflow] -->|Pytest native output + coverage| B1[CI pass/fail status]
    C[E2E Tests Workflow] --> C1[Playwright HTML Report artifact]
    C[E2E Tests Workflow] --> C2[Allure Results artifact]
    C2 -->|On main| D[Deploy Allure Report Workflow]
    D -->|Fetches history from Pages| D
    D --> E[GitHub Pages - Allure Report with History]
```


## Tech Stack

### Application
- **Backend**: Django + Django REST Framework
- **Frontend**: React + Vite + React Router
- **Database**: PostgreSQL (Docker)
- **API**: RESTful

### Testing & QA
- **Backend Testing**: Pytest
- **Frontend Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Postman
- **Test Reporting**: Allure (for E2E, deployed to GitHub Pages)
- **CI/CD**: GitHub Actions


## Project Structure

```
pet-tracker/
├── .github/workflows/
│   ├── frontend-tests.yml
│   ├── backend-tests.yml
│   ├── e2e-tests.yml
│   └── deploy-allure-pages.yml
├── backend/
│   ├── config/
│   ├── pets/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── tests/
│   │       ├── test_models.py
│   │       └── test_api.py
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
│   │   ├── fixtures/
│   │   │   └── pet-fixtures.js
│   │   └── helpers/
│   │       └── api-helpers.js
│   ├── src/
│   │   ├── App.test.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
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
