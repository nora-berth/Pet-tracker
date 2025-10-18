import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vetVisitAPI } from '../../services/api';
import './RecordForm.css';

function AddVetVisit() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pet: petId,
    date: new Date().toISOString().split('T')[0],
    reason: '',
    veterinarian: '',
    notes: '',
    cost: '',
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
      // Only send non-empty fields
      const dataToSend = { ...formData };
      if (!dataToSend.veterinarian) delete dataToSend.veterinarian;
      if (!dataToSend.notes) delete dataToSend.notes;
      if (!dataToSend.cost) delete dataToSend.cost;

      await vetVisitAPI.create(dataToSend);
      navigate(`/pets/${petId}`);
    } catch (err) {
      setError('Failed to add vet visit. Please try again.');
      console.error('Error creating vet visit:', err);
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
        <h1>Add Vet Visit</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Visit Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit *</label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g., Annual checkup, Sick visit"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="veterinarian">Veterinarian</label>
            <input
              type="text"
              id="veterinarian"
              name="veterinarian"
              value={formData.veterinarian}
              onChange={handleChange}
              placeholder="Dr. Smith"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost ($)</label>
            <input
              type="number"
              step="0.01"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Diagnosis, treatment, prescriptions..."
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add Vet Visit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddVetVisit;