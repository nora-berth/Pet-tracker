import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import * as api from './services/api';
import { parentSuite, suite, feature, story, severity, step, Severity } from './test/allure-helpers';

describe('App', () => {
  beforeEach(() => {
    if (api.petAPI && api.petAPI.getAll) {
      vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({ data: [] });
    }
    parentSuite('Frontend Tests');
    suite('Component Tests');
  });

  it('renders the app', () => {
    feature('App Component');
    story('Rendering');
    severity(Severity.CRITICAL);

    // Act
    step('Render App component', () => {
      render(<App />);
    });

    // Assert
    step('Verify Pet Tracker title is visible', () => {
      expect(screen.getByText(/Pet Tracker/i)).toBeInTheDocument();
    });
  });
});