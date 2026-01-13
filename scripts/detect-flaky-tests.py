#!/usr/bin/env python3

import json
import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

def parse_allure_results(results_dir: Path) -> Dict[str, str]:
    """Parse Allure results and extract test names and statuses."""
    tests = {}

    if not results_dir.exists():
        return tests

    # Look for result JSON files
    for result_file in results_dir.glob("*-result.json"):
        try:
            with open(result_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract test name and status
            test_name = data.get('fullName') or data.get('name', 'Unknown')
            status = data.get('status', 'unknown')

            tests[test_name] = status
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Could not parse {result_file}: {e}", file=sys.stderr)
            continue

    return tests

def analyze_flaky_tests(current_results: Dict[str, str],
                       historical_results: List[Dict[str, str]],
                       threshold: float = 0.2) -> List[Tuple[str, List[str], float]]:
    """
    Analyze test results to detect flaky tests.

    Args:
        current_results: Current test run results {test_name: status}
        historical_results: List of previous test run results
        threshold: Minimum failure rate to consider (0.2 = 20%)

    Returns:
        List of (test_name, pattern, failure_rate) for flaky tests
    """
    # Combine all results
    all_results = [current_results] + historical_results

    # Track test outcomes across runs
    test_outcomes = defaultdict(list)

    for results in all_results:
        for test_name, status in results.items():
            test_outcomes[test_name].append(status)

    # Identify flaky tests
    flaky_tests = []

    for test_name, outcomes in test_outcomes.items():
        # Need at least 3 runs to detect flakiness
        if len(outcomes) < 3:
            continue

        # Check if test has both passes and failures
        has_pass = 'passed' in outcomes
        has_fail = any(status in ['failed', 'broken'] for status in outcomes)

        if not (has_pass and has_fail):
            continue

        # Calculate failure rate
        failures = sum(1 for status in outcomes if status in ['failed', 'broken'])
        failure_rate = failures / len(outcomes)

        # Flaky if failure rate is between threshold and (1 - threshold)
        # e.g., between 20% and 80% with default threshold
        if threshold <= failure_rate <= (1 - threshold):
            # Create pattern visualization
            pattern = ['✅' if status == 'passed' else '❌'
                      for status in outcomes]

            flaky_tests.append((test_name, pattern, failure_rate))

    # Sort by failure rate (descending)
    flaky_tests.sort(key=lambda x: x[2], reverse=True)

    return flaky_tests

def format_markdown_report(flaky_tests: List[Tuple[str, List[str], float]]) -> str:
    """Format flaky tests as a markdown report."""
    if not flaky_tests:
        return ""

    lines = ["## ⚠️ Flaky Tests Detected", ""]
    lines.append(f"Found {len(flaky_tests)} potentially flaky test(s):", "")

    for test_name, pattern, failure_rate in flaky_tests:
        failures = sum(1 for icon in pattern if icon == '❌')
        total = len(pattern)
        percentage = failure_rate * 100

        lines.append(f"**{test_name}**")
        lines.append(f"- Failed {failures}/{total} times ({percentage:.1f}%)")
        lines.append(f"- Pattern: {''.join(pattern)}")
        lines.append("")

    return "\n".join(lines)

def main():
    if len(sys.argv) < 2:
        print("Usage: detect-flaky-tests.py <current-results-dir> [previous-results-dir1] [previous-results-dir2] ...")
        print("Example: detect-flaky-tests.py frontend/allure-results previous-run1 previous-run2")
        sys.exit(1)

    current_dir = Path(sys.argv[1])
    previous_dirs = [Path(d) for d in sys.argv[2:]]

    # Parse current results
    print(f"Parsing current results from {current_dir}...", file=sys.stderr)
    current_results = parse_allure_results(current_dir)
    print(f"Found {len(current_results)} tests in current run", file=sys.stderr)

    # Parse historical results
    historical_results = []
    for prev_dir in previous_dirs:
        print(f"Parsing historical results from {prev_dir}...", file=sys.stderr)
        results = parse_allure_results(prev_dir)
        if results:
            historical_results.append(results)
            print(f"Found {len(results)} tests", file=sys.stderr)

    print(f"Total historical runs: {len(historical_results)}", file=sys.stderr)

    # Analyze for flaky tests
    flaky_tests = analyze_flaky_tests(current_results, historical_results)

    # Output markdown report
    report = format_markdown_report(flaky_tests)
    if report:
        print(report)
        sys.exit(1)  # Exit with error code if flaky tests found
    else:
        print("No flaky tests detected.", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()
