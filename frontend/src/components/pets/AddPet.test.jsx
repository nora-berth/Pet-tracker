import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AddPet from './AddPet';
import * as api from '../../services/api';

describe('AddPet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-url');
  });

  it('renders the form with all fields', () => {
    // Act
    render(
      <BrowserRouter>
        <AddPet />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/species/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/breed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add pet/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'create').mockResolvedValue({
      data: { id: 1, name: 'Fluffy', species: 'cat' },
    });

    const user = userEvent.setup();

    // Act
    render(
      <BrowserRouter>
        <AddPet />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/name/i), 'Fluffy');
    await user.selectOptions(screen.getByLabelText(/species/i), 'cat');
    await user.type(screen.getByLabelText(/breed/i), 'Persian');
    await user.click(screen.getByRole('button', { name: /add pet/i }));

    // Assert
    await waitFor(() => {
      expect(api.petAPI.create).toHaveBeenCalledWith({
        name: 'Fluffy',
        species: 'cat',
        breed: 'Persian',
      });
    });
  });

  it('renders photo upload input', () => {
    // Act
    render(
      <BrowserRouter>
        <AddPet />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByLabelText(/photo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photo/i)).toHaveAttribute('type', 'file');
    expect(screen.getByLabelText(/photo/i)).toHaveAttribute('accept', 'image/*');
  });

  it('submits form with photo', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'create').mockResolvedValue({
      data: { id: 1, name: 'Fluffy', species: 'cat', photo: '/media/pet_photos/test.jpg' },
    });

    const user = userEvent.setup();
    const file = new File(['photo-content'], 'test.jpg', { type: 'image/jpeg' });

    // Act
    render(
      <BrowserRouter>
        <AddPet />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/name/i), 'Fluffy');
    await user.selectOptions(screen.getByLabelText(/species/i), 'cat');
    await user.upload(screen.getByLabelText(/photo/i), file);
    await user.click(screen.getByRole('button', { name: /add pet/i }));

    // Assert
    await waitFor(() => {
      expect(api.petAPI.create).toHaveBeenCalled();
      const callArg = api.petAPI.create.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(FormData);
      expect(callArg.get('name')).toBe('Fluffy');
      expect(callArg.get('species')).toBe('cat');
      expect(callArg.get('photo')).toBeInstanceOf(File);
    });
  });
});
