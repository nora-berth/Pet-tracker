import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PetList from './PetList';
import * as api from '../../services/api';

describe('PetList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getAll').mockImplementation(
      () => new Promise(() => {})
    );

    // Act
    render(
      <BrowserRouter>
        <PetList />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText(/loading pets/i)).toBeInTheDocument();
  });

  it('displays pets after loading', async () => {
    // Arrange
    const mockPets = {
      count: 2,
      results: [
        { id: 1, name: 'Buddy', species: 'dog', breed: 'Labrador' },
        { id: 2, name: 'Whiskers', species: 'cat', breed: 'Siamese' },
      ],
    };

    vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({
      data: mockPets,
    });

    // Act
    render(
      <BrowserRouter>
        <PetList />
      </BrowserRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
      expect(screen.getByText('Whiskers')).toBeInTheDocument();
    });
  });

  it('shows message when no pets exist', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({
      data: {
        count: 0,
        results: [],
      },
    });

    // Act
    render(
      <BrowserRouter>
        <PetList />
      </BrowserRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no pets yet/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getAll').mockRejectedValue(
      new Error('Network error')
    );

    // Act
    render(
      <BrowserRouter>
        <PetList />
      </BrowserRouter>
    );

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(/failed to fetch pets/i)
      ).toBeInTheDocument();
    });
  });
});