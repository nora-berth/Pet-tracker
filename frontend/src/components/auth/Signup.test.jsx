import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';
import { AuthProvider } from '../../contexts/AuthContext';
import * as api from '../../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderSignup = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Signup />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Signup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form', () => {
    renderSignup();

    expect(screen.getByText('Sign Up for Pet Tracker')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText(/^password\s*\*?$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('handles successful registration', async () => {
    // Arrange
    const mockResponse = {
      data: {
        token: 'new-token-123',
        user: {
          id: 2,
          username: 'newuser',
          email: 'new@example.com',
          first_name: 'New',
          last_name: 'User',
        },
      },
    };

    vi.spyOn(api.authAPI, 'register').mockResolvedValue(mockResponse);

    renderSignup();

    // Act
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'New' },
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByLabelText(/^password\s*\*?$/i), {
      target: { value: 'securepass123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'securepass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    await waitFor(() => {
      expect(api.authAPI.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        password: 'securepass123',
        password_confirm: 'securepass123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays validation errors', async () => {
    // Arrange
    const mockError = {
      response: {
        data: {
          username: ['A user with this username already exists.'],
          password: ['This password is too short.'],
        },
      },
    };

    vi.spyOn(api.authAPI, 'register').mockRejectedValue(mockError);

    renderSignup();

    // Act
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\s*\*?$/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText('A user with this username already exists.')
      ).toBeInTheDocument();
      expect(screen.getByText('This password is too short.')).toBeInTheDocument();
    });
  });

  it('clears field error when user starts typing', async () => {
    // Arrange
    const mockError = {
      response: {
        data: {
          username: ['This username is taken.'],
        },
      },
    };

    vi.spyOn(api.authAPI, 'register').mockRejectedValue(mockError);

    renderSignup();

    const usernameInput = screen.getByLabelText(/username/i);

    // Act - trigger error
    fireEvent.change(usernameInput, { target: { value: 'taken' } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\s*\*?$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('This username is taken.')).toBeInTheDocument();
    });

    // Act - start typing
    fireEvent.change(usernameInput, { target: { value: 'newtaken' } });

    // Assert - error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('This username is taken.')).not.toBeInTheDocument();
    });
  });

  it('disables form during registration', async () => {
    // Arrange
    vi.spyOn(api.authAPI, 'register').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderSignup();

    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Act
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\s*\*?$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(submitButton);

    // Assert
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('displays network error message', async () => {
    // Arrange
    vi.spyOn(api.authAPI, 'register').mockRejectedValue(new Error('Network error'));

    renderSignup();

    // Act
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\s*\*?$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });
});
