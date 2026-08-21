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
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-url');
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

  it('displays existing photo preview', async () => {
    // Arrange
    const petWithPhoto = { ...mockPet, photo: '/media/pet_photos/buddy.jpg' };
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: petWithPhoto });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      const img = screen.getByAltText('Pet preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'http://localhost:8000/media/pet_photos/buddy.jpg');
    });
  });

  it('submits updated photo', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    vi.spyOn(api.petAPI, 'update').mockResolvedValue({
      data: { ...mockPet, photo: '/media/pet_photos/new.jpg' },
    });

    const user = userEvent.setup();
    const file = new File(['photo-content'], 'new.jpg', { type: 'image/jpeg' });

    // Act
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Buddy');
    });

    await user.upload(screen.getByLabelText(/photo/i), file);
    await user.click(screen.getByRole('button', { name: /update pet/i }));

    // Assert
    await waitFor(() => {
      expect(api.petAPI.update).toHaveBeenCalled();
      const callArg = api.petAPI.update.mock.calls[0][1];
      expect(callArg).toBeInstanceOf(FormData);
      expect(callArg.get('photo')).toBeInstanceOf(File);
    });
  });
});
