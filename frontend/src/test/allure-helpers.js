let allure;

export function initAllure() {
  if (typeof globalThis !== 'undefined' && globalThis.allure) {
    allure = globalThis.allure;
  }
  return allure;
}

/**
 * Mark test feature
 */
export function feature(name) {
  const a = initAllure();
  if (a) {
    a.label('feature', name);
  }
}

/**
 * Mark test story
 */
export function story(name) {
  const a = initAllure();
  if (a) {
    a.label('story', name);
  }
}

/**
 * Set test severity
 */
export function severity(level) {
  const a = initAllure();
  if (a) {
    a.label('severity', level);
  }
}

/**
 * Create a test step
 */
export function step(name, fn) {
  const a = initAllure();
  if (a) {
    return a.step(name, fn);
  }
  return fn();
}

/**
 * Attach data to report
 */
export function attach(name, content, type = 'text/plain') {
  const a = initAllure();
  if (a) {
    a.attachment(name, content, type);
  }
}

// Severity levels
export const Severity = {
  BLOCKER: 'blocker',
  CRITICAL: 'critical',
  NORMAL: 'normal',
  MINOR: 'minor',
  TRIVIAL: 'trivial',
};
