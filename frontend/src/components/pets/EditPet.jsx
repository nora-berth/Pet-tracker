import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { petAPI } from '../../services/api';
import './AddPet.css';

function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    birth_date: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const response = await petAPI.getOne(id);
      const pet = response.data;
      setFormData({
        name: pet.name || '',
        species: pet.species || 'dog',
        breed: pet.breed || '',
        birth_date: pet.birth_date || '',
        notes: pet.notes || '',
      });
    } catch (err) {
      setError('Failed to load pet data');
      console.error('Error fetching pet:', err);
    } finally {
      setFetchLoading(false);
    }
  };

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
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          dataToSend[key] = formData[key];
        }
      });

      await petAPI.update(id, dataToSend);
      navigate(`/pets/${id}`);
    } catch (err) {
      setError('Failed to update pet. Please try again.');
      console.error('Error updating pet:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading">Loading pet data...</div>;

  return (
    <div className="add-pet">
      <button onClick={() => navigate(`/pets/${id}`)} className="back-button">
        ← Back to Pet
      </button>

      <div className="form-container">
        <h1>Edit Pet</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="species">Species *</label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="rabbit">Rabbit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="breed">Breed</label>
            <input
              type="text"
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="birth_date">Birth Date</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
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
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Updating Pet...' : 'Update Pet'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPet;