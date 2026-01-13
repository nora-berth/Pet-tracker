import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AddPet from './AddPet';
import * as api from '../../services/api';
import { parentSuite, feature, story, severity, step, Severity } from '../../test/allure-helpers';

describe('AddPet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    feature('Add Pet Component');
    story('Form Rendering');
    severity(Severity.CRITICAL);

    // Act
    step('Render AddPet component', () => {
      render(
        <BrowserRouter>
          <AddPet />
        </BrowserRouter>
      );
    });

    // Assert
    step('Verify all form fields are present', () => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/species/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/breed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add pet/i })).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    feature('Add Pet Component');
    story('Form Submission');
    severity(Severity.CRITICAL);

    // Arrange
    step('Mock API create method', () => {
      vi.spyOn(api.petAPI, 'create').mockResolvedValue({
        data: { id: 1, name: 'Fluffy', species: 'cat' },
      });
    });

    const user = userEvent.setup();

    // Act
    step('Render AddPet component', () => {
      render(
        <BrowserRouter>
          <AddPet />
        </BrowserRouter>
      );
    });

    await step('Fill in form fields', async () => {
      await user.type(screen.getByLabelText(/name/i), 'Fluffy');
      await user.selectOptions(screen.getByLabelText(/species/i), 'cat');
      await user.type(screen.getByLabelText(/breed/i), 'Persian');
    });

    await step('Click submit button', async () => {
      await user.click(screen.getByRole('button', { name: /add pet/i }));
    });

    // Assert
    await step('Verify API was called with correct data', async () => {
      await waitFor(() => {
        expect(api.petAPI.create).toHaveBeenCalledWith({
          name: 'Fluffy',
          species: 'cat',
          breed: 'Persian',
        });
      });
    });
  });
});