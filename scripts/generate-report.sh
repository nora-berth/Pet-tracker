#!/bin/bash

set -e

# Usage: ./generate-report.sh <suite> <build-id> <commit-sha>
# Example: ./generate-report.sh frontend 12345678 abc123

SUITE=$1
BUILD_ID=$2
COMMIT_SHA=$3

if [ -z "$SUITE" ] || [ -z "$BUILD_ID" ] || [ -z "$COMMIT_SHA" ]; then
  echo "Usage: $0 <suite> <build-id> <commit-sha>"
  echo "Example: $0 frontend 12345678 abc123"
  exit 1
fi

echo "Generating Allure report for $SUITE (build: $BUILD_ID, commit: $COMMIT_SHA)"

# Determine results directory based on suite
if [ "$SUITE" = "frontend" ]; then
  RESULTS_DIR="frontend/allure-results"
elif [ "$SUITE" = "backend" ]; then
  RESULTS_DIR="backend/allure-results"
elif [ "$SUITE" = "e2e" ]; then
  RESULTS_DIR="frontend/allure-results-e2e"
else
  echo "Error: Invalid suite '$SUITE'. Must be frontend, backend, or e2e"
  exit 1
fi

# Check if results directory exists and has content
if [ ! -d "$RESULTS_DIR" ]; then
  echo "Error: Results directory $RESULTS_DIR does not exist"
  exit 1
fi

if [ -z "$(ls -A $RESULTS_DIR)" ]; then
  echo "Warning: Results directory $RESULTS_DIR is empty"
  # Create a placeholder report
  mkdir -p "allure-report-${SUITE}-${BUILD_ID}"
  echo "<h1>No test results found for $SUITE</h1>" > "allure-report-${SUITE}-${BUILD_ID}/index.html"
  exit 0
fi

# Install Allure CLI if not present
if ! command -v allure &> /dev/null; then
  echo "Installing Allure CLI..."
  ALLURE_VERSION="2.25.0"
  wget -q "https://github.com/allure-framework/allure2/releases/download/${ALLURE_VERSION}/allure-${ALLURE_VERSION}.tgz"
  tar -zxf "allure-${ALLURE_VERSION}.tgz"
  sudo mv "allure-${ALLURE_VERSION}" /opt/allure
  sudo ln -s /opt/allure/bin/allure /usr/bin/allure
  rm "allure-${ALLURE_VERSION}.tgz"
  echo "Allure CLI installed successfully"
fi

# Generate the report
OUTPUT_DIR="allure-report-${SUITE}-${BUILD_ID}"
echo "Generating report from $RESULTS_DIR to $OUTPUT_DIR..."
allure generate "$RESULTS_DIR" --clean -o "$OUTPUT_DIR"

# Create metadata file
cat > "$OUTPUT_DIR/build-info.json" <<EOF
{
  "suite": "$SUITE",
  "buildId": "$BUILD_ID",
  "commit": "$COMMIT_SHA",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Report generated successfully at $OUTPUT_DIR"
echo "Total size: $(du -sh $OUTPUT_DIR | cut -f1)"
