# Pet Tracker API - Postman Test Suite

This directory contains a comprehensive Postman collection for testing the Pet Tracker API. The collection includes automated tests for API endpoints with validation of responses, data integrity, and performance.


## Contents

- `Pet Tracker API.postman_collection.json` - Complete API test collection
- `Local Development.postman_environment.json` - Environment variables for local testing


## Quick Start

### 1. Import into Postman

1. Open Postman
2. Click **Import**
3. Select files from this directory:
4. Click **Import**

### 2. Configure Environment

1. Select the **Local Development** environment from the environment dropdown
2. Set the required variables:
   - `baseUrl`: `http://localhost:8000`
   - `apiPath`: `/api`

### 3. Start the Backend Server

Before running tests, ensure the Django backend is running:

```bash
cd backend
venv\Scripts\activate  # Windows (or source venv/bin/activate on Mac/Linux)
python manage.py runserver
```

Also ensure PostgreSQL is running:

```bash
docker-compose up -d
```

### 4. Run the Collection

**Option A: Run entire collection**
1. Click on the collection name "Pet Tracker API"
2. Click **Run** to open the Collection Runner
3. Ensure "Local Development" environment is selected
4. Click **Run Pet Tracker API**

**Option B: Run individual requests**
1. Navigate to any request in the collection
2. Click **Send**
3. View test results in the **Test Results** tab


## Collection Structure

### Endpoints Covered

| Request | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Get All Pets | GET | `/api/pets/` | Retrieves paginated list of all pets |
| Create Pet | POST | `/api/pets/` | Creates a new pet and stores ID in environment |
| Get Pet by ID | GET | `/api/pets/{petId}/` | Retrieves specific pet by ID |

### Automated Tests Included

Each request includes multiple automated tests:

**Get All Pets**
- ✓ Status code is 200
- ✓ Response time is less than 500ms
- ✓ Response has pagination structure (count, results)
- ✓ Content-Type is application/json

**Create Pet**
- ✓ Status code is 201 Created
- ✓ Response contains pet data (id, name)
- ✓ Pet species matches request
- ✓ Pet has created_at timestamp
- ✓ Stores pet ID in environment for subsequent requests

**Get Pet by ID**
- ✓ Status code is 200
- ✓ Pet ID matches the stored environment variable
- ✓ Pet name is correct
- ✓ All required fields are present (id, name, species, created_at, updated_at)


## Environment Variables

The Local Development environment uses the following variables:

| Variable | Purpose | Auto-populated |
|----------|---------|----------------|
| `baseUrl` | Base URL of the API server | No (set manually) |
| `apiPath` | API path prefix | No (set manually) |
| `petId` | ID of created pet | Yes (from Create Pet) |
| `weightRecordId` | ID of weight record | Yes (future use) |
| `vaccinationId` | ID of vaccination record | Yes (future use) |
| `vetVisitId` | ID of vet visit record | Yes (future use) |


## Test Execution Order

For best results, run requests in this order:

1. **Get All Pets** - Verifies API is accessible and returns data
2. **Create Pet** - Creates a test pet and stores its ID
3. **Get Pet by ID** - Verifies the created pet can be retrieved

This order ensures environment variables are populated correctly for dependent requests.


## Viewing Test Results

### In Postman UI

After sending a request:
1. Scroll down to the **Test Results** tab
2. Green checkmarks indicate passing tests
3. Red X marks indicate failing tests
4. Click on any test to see details

### In Collection Runner

After running the full collection:
1. View summary statistics (total tests, passed, failed)
2. See execution time for each request
3. Filter by passed/failed tests
4. Export results if needed

## Troubleshooting

### Connection Refused / Cannot reach API

**Solution**: Ensure the Django backend is running on `http://localhost:8000`

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### Tests failing on "Get Pet by ID"

**Cause**: `petId` environment variable not set

**Solution**: Run "Create Pet" request first to populate the `petId` variable

### Database errors

**Solution**: Ensure PostgreSQL is running via Docker

```bash
docker-compose up -d
```

### Wrong baseUrl or apiPath

**Solution**: Check environment variables are set correctly:
- `baseUrl`: `http://localhost:8000`
- `apiPath`: `/api`
