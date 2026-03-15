# Pet Tracker API - Postman Test Suite

This directory contains a comprehensive Postman collection for testing the Pet Tracker API. The collection includes automated tests for authentication, CRUD operations, and multi-tenancy with validation of responses, data integrity, and performance.


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


## Authentication

The collection uses **Token Authentication**. A collection-level `Authorization: Token {{authToken}}` header is applied automatically to all requests that require authentication.

- The **Register User** request generates a unique test user (timestamp-based) and stores the auth token
- Public endpoints (register, login) override the collection auth with "No Auth"
- The **Unauthenticated Access** test verifies that protected endpoints reject requests without a token


## Environment Variables

The Local Development environment uses the following variables:

| Variable | Purpose | Auto-populated |
|----------|---------|----------------|
| `baseUrl` | Base URL of the API server | No (set manually) |
| `apiPath` | API path prefix | No (set manually) |
| `authToken` | Auth token for authenticated requests | Yes (from Register/Login) |
| `testUsername` | Generated test username | Yes (from Register pre-request) |
| `testPassword` | Test user password | Yes (from Register pre-request) |
| `testEmail` | Generated test email | Yes (from Register pre-request) |
| `petId` | ID of created pet | Yes |
| `weightRecordId` | ID of weight record | Yes |
| `vaccinationId` | ID of vaccination record | Yes |
| `vetVisitId` | ID of vet visit record | Yes |


## Test Execution Order

The collection is organized into folders that must run in order:

### 1. Authentication
1. **Register User** - Creates a test user, stores auth token
2. **Register Duplicate Username** - Verifies duplicate username rejection (400)
3. **Login with Valid Credentials** - Logs in with test user, stores token
4. **Login with Invalid Password** - Verifies invalid credentials rejection (400)
5. **Get Profile** - Retrieves authenticated user profile
6. **Unauthenticated Access** - Verifies 401 for requests without token

### 2. Pets
7. **Get All Pets** - Verifies API returns paginated data for authenticated user
8. **Create Pet** - Creates a test pet, verifies owner assignment, stores pet ID
9. **Get Pet by ID** - Retrieves pet with nested records, verifies owner
10. **Update Pet** - Full update via PUT, verifies owner unchanged
11. **Partial Update Pet** - Partial update via PATCH, verifies unchanged fields
12. **Delete Pet** - Deletes the pet (204)
13. **Get Deleted Pet** - Confirms 404 after deletion

### 3. Cleanup
14. **Logout** - Deletes auth token, cleans up environment variables

This order ensures environment variables are populated correctly for dependent requests.


## Running via Newman (CLI)

You can run the collection from the command line using Newman:

```bash
# Install Newman and HTML reporter (one-time)
npm install -g newman newman-reporter-htmlextra

# Run collection
newman run "backend/postman/Pet Tracker API.postman_collection.json" \
  -e "backend/postman/Local Development.postman_environment.json"

# Run with HTML report
newman run "backend/postman/Pet Tracker API.postman_collection.json" \
  -e "backend/postman/Local Development.postman_environment.json" \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export newman-report.html
```

Newman also runs automatically in CI via the `api-tests.yml` GitHub Actions workflow. Results are available as workflow artifacts (JSON + HTML report) and in the GitHub Step Summary.


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
### Database errors

**Solution**: Ensure PostgreSQL is running via Docker

```bash
docker-compose up -d
```

### Wrong baseUrl or apiPath

**Solution**: Check environment variables are set correctly:
- `baseUrl`: `http://localhost:8000`
- `apiPath`: `/api`
