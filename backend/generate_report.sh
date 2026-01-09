#!/bin/bash
# Generate Allure report for backend tests

echo "Running backend tests..."
pytest --alluredir=allure-results

echo "Generating Allure report..."
allure generate allure-results --clean -o allure-report

echo "Backend report generated in allure-report/"