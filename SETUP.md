## Setup

### Prerequisites
- Python 3.11+
- Node 20+
- Docker Desktop
- Git

### 1. Clone Repository
```bash
git clone https://github.com/nora-berth/pet-tracker.git
cd pet-tracker
```

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows (or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```


## Running Tests

### Backend Tests
```bash
cd backend
venv\Scripts\activate
pytest                              # Run all tests
pytest --cov=pets --cov-report=term # With coverage
pytest pets/tests/test_models.py    # Specific test file
pytest -k "test_pet_create"         # By test name
```

### Frontend Unit Tests
```bash
cd frontend
npm test           # Run tests
npm test:ui        # Run with Vitest UI
```

### E2E Tests
```bash
cd frontend
npx playwright test                 # Run all E2E tests
npx playwright test --headed        # With browser visible
npx playwright test --debug         # Debug mode
npx playwright show-report          # View HTML report
```

### Generate Allure Reports Locally
```bash
# Backend
cd backend
pytest --alluredir=allure-results
allure serve allure-results

# Frontend
cd frontend
npm test -- --run
allure serve allure-results

# E2E
cd frontend
npx playwright test
allure serve allure-results
```