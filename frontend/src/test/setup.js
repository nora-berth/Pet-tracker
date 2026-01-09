import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

(async () => {
  try {
    await import('allure-vitest/setup');
  } catch (e) {
  }
})();

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
