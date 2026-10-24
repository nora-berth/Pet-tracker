## Setup

### Prerequisites
- Python 3.10 or newer (required by Django 5.2; macOS ships Python 3.9, so install a newer one, e.g. `brew install python@3.12`)
- Node 20.19 or newer, or 22.12 or newer (required by Vite 8)
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
cp .env.example .env  # Windows: copy .env.example .env
python -m venv venv   # on macOS use python3.10+ explicitly, e.g. python3.12 -m venv venv
venv\Scripts\activate  # Windows (or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000
```

The `.env` file holds the database settings (host, port 5432, credentials) that match `docker-compose.yml`. Without it, Django falls back to built-in defaults.

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
```

### E2E Tests
```bash
cd e2e
npx playwright test                 # Run all E2E tests
npx playwright test --headed        # With browser visible
npx playwright test --debug         # Debug mode
npx playwright show-report          # View HTML report
```

### View E2E Allure Report Locally
```bash
# Run E2E tests to generate results
cd e2e
npx playwright test

# Serve Allure report (requires Allure CLI)
allure serve allure-results-e2e
```
