# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pet Tracker is a full-stack web application for managing pet health records. It tracks pets, weight records, vaccinations, and vet visits.

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
pytest                        # Run all tests
pytest pets/tests/test_models.py  # Run specific test file
pytest -k "test_name"         # Run test by name

# Frontend tests (Vitest)
cd frontend
npm run test     # Run tests
npm run test:ui  # Run tests with UI
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