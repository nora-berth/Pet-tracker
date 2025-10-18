import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { weightAPI } from '../../services/api';
import './RecordForm.css';

function AddWeightRecord() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pet: petId,
    date: new Date().toISOString().split('T')[0],
    weight: '',
    unit: 'kg',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await weightAPI.create(formData);
      navigate(`/pets/${petId}`);
    } catch (err) {
      setError('Failed to add weight record. Please try again.');
      console.error('Error creating weight record:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="record-form">
      <button onClick={() => navigate(`/pets/${petId}`)} className="back-button">
        ← Back to Pet
      </button>

      <div className="form-container">
        <h1>Add Weight Record</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Weight *</label>
              <input
                type="number"
                step="0.01"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add Weight Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddWeightRecord;