import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

describe('App Component', () => {
  beforeEach(() => {
    if (api.petAPI && api.petAPI.getAll) {
      vi.spyOn(api.petAPI, 'getAll').mockResolvedValue({ data: [] });
    }
  });

  it('renders the app', () => {
    // Act
    render(<App />);

    // Assert
    expect(screen.getByText(/Pet Tracker/i)).toBeInTheDocument();
  });
});
