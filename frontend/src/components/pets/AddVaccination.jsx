import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vaccinationAPI } from '../../services/api';
import './RecordForm.css';

function AddVaccination() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pet: petId,
    vaccine_name: '',
    date_administered: new Date().toISOString().split('T')[0],
    due_date: '',
    veterinarian: '',
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
      // Only send non-empty fields
      const dataToSend = { ...formData };
      if (!dataToSend.due_date) delete dataToSend.due_date;
      if (!dataToSend.veterinarian) delete dataToSend.veterinarian;
      if (!dataToSend.notes) delete dataToSend.notes;

      await vaccinationAPI.create(dataToSend);
      navigate(`/pets/${petId}`);
    } catch (err) {
      setError('Failed to add vaccination record. Please try again.');
      console.error('Error creating vaccination:', err);
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
        <h1>Add Vaccination</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vaccine_name">Vaccine Name *</label>
            <input
              type="text"
              id="vaccine_name"
              name="vaccine_name"
              value={formData.vaccine_name}
              onChange={handleChange}
              placeholder="e.g., Rabies, DHPP"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_administered">Date Administered *</label>
            <input
              type="date"
              id="date_administered"
              name="date_administered"
              value={formData.date_administered}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date (Next Dose)</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
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
            {loading ? 'Adding...' : 'Add Vaccination'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddVaccination;