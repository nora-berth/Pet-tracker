import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditPet from './EditPet';
import * as api from '../../services/api';

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
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockImplementation(
      () => new Promise(() => {})
    );

    // Act
    renderWithRouter();

    // Assert
    expect(screen.getByText(/loading pet data/i)).toBeInTheDocument();
  });

  it('populates form with existing pet data', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Buddy');
      expect(screen.getByLabelText(/species/i)).toHaveValue('dog');
      expect(screen.getByLabelText(/breed/i)).toHaveValue('Labrador');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Friendly dog');
    });
  });

  it('submits updated pet data', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    vi.spyOn(api.petAPI, 'update').mockResolvedValue({ data: { ...mockPet, name: 'Max' } });

    const user = userEvent.setup();

    // Act
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Buddy');
    });

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Max');
    await user.click(screen.getByRole('button', { name: /update pet/i }));

    // Assert
    await waitFor(() => {
      expect(api.petAPI.update).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Max',
      }));
    });
  });

  it('shows error when fetch fails', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockRejectedValue(new Error('Network error'));

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/failed to load pet data/i)).toBeInTheDocument();
    });
  });
});
