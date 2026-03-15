import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
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

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();

    expect(screen.getByText('Login to Pet Tracker')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    // Arrange
    const mockResponse = {
      data: {
        token: 'test-token-123',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
      },
    };

    vi.spyOn(api.authAPI, 'login').mockResolvedValue(mockResponse);

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Act
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass123' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(api.authAPI.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on login failure', async () => {
    // Arrange
    const mockError = {
      response: {
        data: {
          non_field_errors: ['Invalid username or password.'],
        },
      },
    };

    vi.spyOn(api.authAPI, 'login').mockRejectedValue(mockError);

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Act
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });
  });

  it('displays generic error message on network failure', async () => {
    // Arrange
    vi.spyOn(api.authAPI, 'login').mockRejectedValue(new Error('Network error'));

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Act
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass123' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('clears error when user starts typing', async () => {
    // Arrange
    const mockError = {
      response: {
        data: {
          non_field_errors: ['Invalid credentials'],
        },
      },
    };

    vi.spyOn(api.authAPI, 'login').mockRejectedValue(mockError);

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Act - trigger error
    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Act - start typing
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });

    // Assert - error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });

  it('disables form during login', async () => {
    // Arrange
    vi.spyOn(api.authAPI, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderLogin();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Act
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass123' } });
    fireEvent.click(submitButton);

    // Assert
    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });
});
