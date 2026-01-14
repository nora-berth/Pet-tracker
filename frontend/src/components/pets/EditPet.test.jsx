import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditPet from './EditPet';
import * as api from '../../services/api';
import { feature, story, severity, step, Severity } from '../../test/allure-helpers';

const renderWithRouter = (petId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/pets/${petId}/edit`]}>
      <Routes>
        <Route path="/pets/:id/edit" element={<EditPet />} />
      </Routes>
    </MemoryRouter>
  );
};

const mockPet = {
  id: 1,
  name: 'Buddy',
  species: 'dog',
  breed: 'Labrador',
  birth_date: '2020-05-15',
  notes: 'Friendly dog',
};

describe('EditPet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching pet', () => {
    feature('Edit Pet Component');
    story('Loading States');
    severity(Severity.NORMAL);

    // Arrange
    step('Mock API to never resolve', () => {
      vi.spyOn(api.petAPI, 'getOne').mockImplementation(
        () => new Promise(() => {})
      );
    });

    // Act
    step('Render EditPet component', () => {
      renderWithRouter();
    });

    // Assert
    step('Verify loading message is visible', () => {
      expect(screen.getByText(/loading pet data/i)).toBeInTheDocument();
    });
  });

  it('populates form with existing pet data', async () => {
    feature('Edit Pet Component');
    story('Form Population');
    severity(Severity.CRITICAL);

    // Arrange
    step('Mock API to return pet data', () => {
      vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    });

    // Act
    step('Render EditPet component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify form is populated with pet data', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('Buddy');
        expect(screen.getByLabelText(/species/i)).toHaveValue('dog');
        expect(screen.getByLabelText(/breed/i)).toHaveValue('Labrador');
        expect(screen.getByLabelText(/notes/i)).toHaveValue('Friendly dog');
      });
    });
  });

  it('submits updated pet data', async () => {
    feature('Edit Pet Component');
    story('Form Submission');
    severity(Severity.CRITICAL);

    // Arrange
    step('Mock API methods', () => {
      vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
      vi.spyOn(api.petAPI, 'update').mockResolvedValue({ data: { ...mockPet, name: 'Max' } });
    });

    const user = userEvent.setup();

    // Act
    step('Render EditPet component', () => {
      renderWithRouter();
    });

    await step('Wait for form to load', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('Buddy');
      });
    });

    await step('Update name field', async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Max');
    });

    await step('Click update button', async () => {
      await user.click(screen.getByRole('button', { name: /update pet/i }));
    });

    // Assert
    await step('Verify API was called with updated data', async () => {
      await waitFor(() => {
        expect(api.petAPI.update).toHaveBeenCalledWith('1', expect.objectContaining({
          name: 'Max',
        }));
      });
    });
  });

  it('shows error when fetch fails', async () => {
    feature('Edit Pet Component');
    story('Error Handling');
    severity(Severity.NORMAL);

    // Arrange
    step('Mock API to reject', () => {
      vi.spyOn(api.petAPI, 'getOne').mockRejectedValue(new Error('Network error'));
    });

    // Act
    step('Render EditPet component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify error message is displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText(/failed to load pet data/i)).toBeInTheDocument();
      });
    });
  });
});
