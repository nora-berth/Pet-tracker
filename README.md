## Setup Instructions

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
```

### Frontend Setup
```bash
cd frontend
npm install
```


## Development Commands

### Run Docker container
```bash
docker-compose up -d  # Start PostgreSQL database
```

### Backend Server
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

### Frontend Server
```bash
cd frontend
npm run dev
```

### Running Tests
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pytest
```

### Database Migrations
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
```

### Database Access
```bash
psql -h localhost -p 5432 -U postgres -d pet_tracker_db
```
