import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petAPI } from '../../services/api';
import './AddPet.css';

function AddPet() {
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
            const dataToSend = {};
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    dataToSend[key] = formData[key];
                }
            });

            await petAPI.create(dataToSend);
            navigate('/');
        } catch (err) {
            setError('Failed to create pet. Please try again.');
            console.error('Error creating pet:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-pet">
            <button onClick={() => navigate('/')} className="back-button">
                ← Back to Pets
            </button>

            <div className="form-container">
                <h1>Add New Pet</h1>
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
                            <option value="ferret">Ferret</option>
                            <option value="tortoise">Tortoise</option>
                            <option value="rabbit">Rabbit</option>  
                            <option value="bird">Bird</option>
                            <option value="hamster">Hamster</option>
                            <option value="guinea_pig">Guinea Pig</option>
                            <option value="snake">Snake</option>
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
                        {loading ? 'Adding Pet...' : 'Add Pet'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddPet;