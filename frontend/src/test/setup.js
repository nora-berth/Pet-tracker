import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'allure-vitest/setup';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
