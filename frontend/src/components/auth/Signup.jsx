import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { token, user } = response.data;

      // Auto-login after successful registration
      login(token, user);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up for Pet Tracker</h1>

        {errors.general && (
          <div className="error-message" role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              disabled={loading}
            />
            {errors.username && (
              <span className="field-error">{errors.username[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && (
              <span className="field-error">{errors.email[0]}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              autoComplete="new-password"
              disabled={loading}
            />
            {errors.password && (
              <span className="field-error">{errors.password[0]}</span>
            )}
            <small className="form-help">Minimum 8 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="password_confirm">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              minLength="8"
              autoComplete="new-password"
              disabled={loading}
            />
            {errors.password_confirm && (
              <span className="field-error">{errors.password_confirm[0]}</span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
