#!/bin/bash
# Generate Allure report for E2E tests

echo "Running E2E tests..."
npx playwright test

echo "Generating Allure report..."
npx allure generate allure-results-e2e --clean -o allure-report-e2e

echo "E2E report generated in allure-report-e2e/"