import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petAPI } from '../../services/api';
import './PetList.css';

function PetList() {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await petAPI.getAll();
            setPets(response.data.results || response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch pets. Make sure the Django server is running.');
            console.error('Error fetching pets:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading pets...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="pet-list">
            <div className="pet-list-header">
                <h2>My Pets</h2>
                <button
                    onClick={() => navigate('/add-pet')}
                    className="add-pet-button"
                >
                    + Add Pet
                </button>
            </div>
            {pets.length === 0 ? (
                <p>No pets yet. Add your first pet!</p>
            ) : (
                <div className="pet-grid">
                    {pets.map((pet) => (
                        <div key={pet.id} className="pet-card"
                            onClick={() => navigate(`/pets/${pet.id}`)}
                            style={{ cursor: 'pointer' }}>
                            {pet.photo && (
                                <img
                                    src={`http://localhost:8000${pet.photo}`}
                                    alt={pet.name}
                                    className="pet-photo"
                                />
                            )}
                            <h3>{pet.name}</h3>
                            <p className="pet-species">{pet.species}</p>
                            {pet.breed && <p className="pet-breed">{pet.breed}</p>}
                            {pet.birth_date && (
                                <p className="pet-birth-date">
                                    Born: {new Date(pet.birth_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PetList;