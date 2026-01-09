#!/bin/bash
# Generate Allure report for frontend tests

echo "Running frontend tests..."
npm test -- --run

echo "Generating Allure report..."
npx allure generate allure-results --clean -o allure-report-frontend

echo "Frontend report generated in allure-report-frontend/"