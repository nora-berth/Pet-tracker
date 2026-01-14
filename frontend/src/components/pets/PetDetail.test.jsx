import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import PetDetail from './PetDetail';
import * as api from '../../services/api';
import { feature, story, severity, step, Severity } from '../../test/allure-helpers';

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
  });

  it('shows loading state initially', () => {
    feature('Pet Detail Component');
    story('Loading States');
    severity(Severity.NORMAL);

    // Arrange
    step('Mock API to never resolve', () => {
      vi.spyOn(api.petAPI, 'getOne').mockImplementation(
        () => new Promise(() => {})
      );
    });

    // Act
    step('Render PetDetail component', () => {
      renderWithRouter();
    });

    // Assert
    step('Verify loading message is visible', () => {
      expect(screen.getByText(/loading pet details/i)).toBeInTheDocument();
    });
  });

  it('displays pet details after loading', async () => {
    feature('Pet Detail Component');
    story('Display Pet');
    severity(Severity.CRITICAL);

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

    step('Mock API to return pet data', () => {
      vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    });

    // Act
    step('Render PetDetail component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify pet details are displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText('Buddy')).toBeInTheDocument();
        expect(screen.getByText('dog')).toBeInTheDocument();
        expect(screen.getByText('Labrador')).toBeInTheDocument();
        expect(screen.getByText('Friendly dog')).toBeInTheDocument();
      });
    });
  });

  it('displays pet records when available', async () => {
    feature('Pet Detail Component');
    story('Display Records');
    severity(Severity.CRITICAL);

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

    step('Mock API to return pet with records', () => {
      vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    });

    // Act
    step('Render PetDetail component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify records are displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText(/4\.5/)).toBeInTheDocument();
        expect(screen.getByText('Rabies')).toBeInTheDocument();
        expect(screen.getByText(/Annual checkup/)).toBeInTheDocument();
      });
    });
  });

  it('shows empty state for records', async () => {
    feature('Pet Detail Component');
    story('Empty States');
    severity(Severity.NORMAL);

    // Arrange
    const mockPet = {
      id: 1,
      name: 'Luna',
      species: 'rabbit',
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };

    step('Mock API to return pet without records', () => {
      vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    });

    // Act
    step('Render PetDetail component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify empty state messages are displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText(/no weight records yet/i)).toBeInTheDocument();
        expect(screen.getByText(/no vaccination records yet/i)).toBeInTheDocument();
        expect(screen.getByText(/no vet visit records yet/i)).toBeInTheDocument();
      });
    });
  });

  it('shows error message when API fails', async () => {
    feature('Pet Detail Component');
    story('Error Handling');
    severity(Severity.CRITICAL);

    // Arrange
    step('Mock API to reject with error', () => {
      vi.spyOn(api.petAPI, 'getOne').mockRejectedValue(new Error('Network error'));
    });

    // Act
    step('Render PetDetail component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify error message is displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch pet details/i)).toBeInTheDocument();
      });
    });
  });

  it('renders action buttons', async () => {
    feature('Pet Detail Component');
    story('UI Elements');
    severity(Severity.NORMAL);

    // Arrange
    const mockPet = {
      id: 1,
      name: 'Buddy',
      species: 'dog',
      weight_records: [],
      vaccinations: [],
      vet_visits: [],
    };

    step('Mock API to return pet', () => {
      vi.spyOn(api.petAPI, 'getOne').mockResolvedValue({ data: mockPet });
    });

    // Act
    step('Render PetDetail component', () => {
      renderWithRouter();
    });

    // Assert
    await step('Verify action buttons are rendered', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit pet/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete pet/i })).toBeInTheDocument();
        expect(screen.getByText(/back to pets/i)).toBeInTheDocument();
      });
    });
  });
});
