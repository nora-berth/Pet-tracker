import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PetDetail from './PetDetail';
import * as api from '../../services/api';

const renderWithRouter = (petId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/pets/${petId}`]}>
      <Routes>
        <Route path="/pets/:id" element={<PetDetail />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PetDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api.sharingAPI, 'getSharedWith').mockResolvedValue({ data: [] });
  });

  it('shows loading state initially', () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockImplementation(
      () => new Promise(() => { })
    );

    // Act
    renderWithRouter();

    // Assert
    expect(screen.getByText(/loading pet details/i)).toBeInTheDocument();
  });

  it('displays pet details after loading', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      breed: 'Labrador',
      birth_date: '2020-05-15',
      notes: 'Friendly dog',
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };

    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('Labrador')).toBeInTheDocument();
      expect(screen.getByText('Friendly dog')).toBeInTheDocument();
    });
  });

  it('displays pet records when available', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Max',
      species: 'cat',
      weight_records: [
        { id: 1, date: '2024-01-15', weight: '4.5', unit: 'kg' },
      ],
      vaccinations: [
        { id: 1, vaccine_name: 'Rabies', date_administered: '2024-01-10' },
      ],
      vet_visits: [
        { id: 1, date: '2024-01-20', reason: 'Annual checkup' },
      ],
    };

    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/4\.5/)).toBeInTheDocument();
      expect(screen.getByText('Rabies')).toBeInTheDocument();
      expect(screen.getByText(/Annual checkup/)).toBeInTheDocument();
    });
  });

  it('shows empty state for records', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Luna',
      species: 'rabbit',
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };

    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no weight records yet/i)).toBeInTheDocument();
      expect(screen.getByText(/no vaccination records yet/i)).toBeInTheDocument();
      expect(screen.getByText(/no vet visit records yet/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    // Arrange
    vi.spyOn(api.petAPI, 'getOne').mockRejectedValue(new Error('Network error'));

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch pet details/i)).toBeInTheDocument();
    });
  });

  it('renders action buttons', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      user_role: 'owner',
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };

    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit pet/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete pet/i })).toBeInTheDocument();
      expect(screen.getByText(/back to pets/i)).toBeInTheDocument();
    });
  });
  
  it('shows sharing section for owner', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      user_role: 'owner',
      is_shared: false,
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Sharing')).toBeInTheDocument();
      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });
  });

  it('hides sharing section for viewer', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      user_role: 'viewer',
      is_shared: true,
      owner_username: 'someone',
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
    expect(screen.queryByText('Sharing')).not.toBeInTheDocument();
  });

  it('hides edit and delete buttons for viewer', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      user_role: 'viewer',
      is_shared: true,
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /edit pet/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete pet/i })).not.toBeInTheDocument();
  });

  it('shows add record buttons for editor', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      user_role: 'editor',
      is_shared: true,
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /\+ add/i });
      expect(addButtons).toHaveLength(3);
    });
  });

  it('hides add record buttons for viewer', async () => {
    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      user_role: 'viewer',
      is_shared: true,
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };
    vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });

    // Act
    renderWithRouter();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('button', { name: /\+ add/i })).toHaveLength(0);
  });
});
