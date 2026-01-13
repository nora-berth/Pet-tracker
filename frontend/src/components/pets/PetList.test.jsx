import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PetList from './PetList';
import * as api from '../../services/api';
import { parentSuite, feature, story, severity, step, Severity } from '../../test/allure-helpers';

describe('PetList Component', () => {
  parentSuite('Frontend Tests');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    feature('Pet List Component');
    story('Loading States');
    severity(Severity.NORMAL);

    // Arrange
    step('Mock API to never resolve', () => {
      vi.spyOn(api.petAPI, 'getAll').mockImplementation(
        () => new Promise(() => { })
      );
    });

    // Act
    step('Render PetList component', () => {
      render(
        <BrowserRouter>
          <PetList />
        </BrowserRouter>
      );
    });

    // Assert
    step('Verify loading message is visible', () => {
      expect(screen.getByText(/loading pets/i)).toBeInTheDocument();
    });
  });

  it('displays pets after loading', async () => {
    feature('Pet List Component');
    story('Display Pets');
    severity(Severity.CRITICAL);

    // Arrange
    const mockPets = {
      count: 2,
      results: [
        { id: 1, name: 'Buddy', species: 'dog', breed: 'Labrador' },
        { id: 2, name: 'Whiskers', species: 'cat', breed: 'Siamese' },
      ],
    };

    step('Mock API to return pet list', () => {
      vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({
        data: mockPets,
      });
    });

    // Act
    step('Render PetList component', () => {
      render(
        <BrowserRouter>
          <PetList />
        </BrowserRouter>
      );
    });

    // Assert
    await step('Verify pets are displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText('Buddy')).toBeInTheDocument();
        expect(screen.getByText('Whiskers')).toBeInTheDocument();
      });
    });
  });

  it('shows message when no pets exist', async () => {
    feature('Pet List Component');
    story('Empty States');
    severity(Severity.NORMAL);

    // Arrange
    step('Mock API to return empty list', () => {
      vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({
        data: {
          count: 0,
          results: [],
        },
      });
    });

    // Act
    step('Render PetList component', () => {
      render(
        <BrowserRouter>
          <PetList />
        </BrowserRouter>
      );
    });

    // Assert
    await step('Verify empty state message is displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText(/no pets yet/i)).toBeInTheDocument();
      });
    });
  });

  it('shows error message when API fails', async () => {
    feature('Pet List Component');
    story('Error Handling');
    severity(Severity.CRITICAL);

    // Arrange
    step('Mock API to reject with error', () => {
      vi.spyOn(api.petAPI, 'getAll').mockRejectedValue(
        new Error('Network error')
      );
    });

    // Act
    step('Render PetList component', () => {
      render(
        <BrowserRouter>
          <PetList />
        </BrowserRouter>
      );
    });

    // Assert
    await step('Verify error message is displayed', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/failed to fetch pets/i)
        ).toBeInTheDocument();
      });
    });
  });

  it('renders Add Pet button', async () => {
    feature('Pet List Component');
    story('UI Elements');
    severity(Severity.NORMAL);

    // Arrange
    step('Mock API to return empty list', () => {
      vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({
        data: { count: 0, results: [] },
      });
    });

    // Act
    step('Render PetList component', () => {
      render(
        <BrowserRouter>
          <PetList />
        </BrowserRouter>
      );
    });

    // Assert
    await step('Verify Add Pet button is rendered', async () => {
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add pet/i });
        expect(addButton).toBeInTheDocument();
      });
    });
  });

  it('renders clickable pet cards', async () => {
    feature('Pet List Component');
    story('UI Elements');
    severity(Severity.NORMAL);

    // Arrange
    const mockPets = {
      count: 1,
      results: [
        { id: 1, name: 'Buddy', species: 'dog', breed: 'Labrador' },
      ],
    };

    step('Mock API to return pet list', () => {
      vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({
        data: mockPets,
      });
    });

    // Act
    step('Render PetList component', () => {
      render(
        <BrowserRouter>
          <PetList />
        </BrowserRouter>
      );
    });

    await step('Wait for pet to be displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText('Buddy')).toBeInTheDocument();
      });
    });

    // Assert
    step('Verify pet card is clickable', () => {
      const petCard = screen.getByText('Buddy').closest('.pet-card');
      expect(petCard).toHaveStyle({ cursor: 'pointer' });
    });
  });
});