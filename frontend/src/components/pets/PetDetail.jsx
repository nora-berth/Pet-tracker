import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petAPI, weightAPI, vaccinationAPI, vetVisitAPI } from '../../services/api';
import './PetDetail.css';


function PetDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPet();
    }, [id]);

    const fetchPet = async () => {
        try {
            setLoading(true);
            const response = await petAPI.getOne(id);
            setPet(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch pet details.');
            console.error('Error fetching pet:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWeight = async (weightId) => {
        if (!window.confirm('Are you sure you want to delete this weight record?')) {
            return;
        }
        try {
            await weightAPI.delete(weightId);
            fetchPet(); // Refresh data
        } catch (err) {
            console.error('Error deleting weight record:', err);
            alert('Failed to delete weight record');
        }
    };

    const handleDeleteVaccination = async (vaccinationId) => {
        if (!window.confirm('Are you sure you want to delete this vaccination record?')) {
            return;
        }
        try {
            await vaccinationAPI.delete(vaccinationId);
            fetchPet(); // Refresh data
        } catch (err) {
            console.error('Error deleting vaccination:', err);
            alert('Failed to delete vaccination');
        }
    };

    const handleDeleteVetVisit = async (vetVisitId) => {
        if (!window.confirm('Are you sure you want to delete this vet visit?')) {
            return;
        }
        try {
            await vetVisitAPI.delete(vetVisitId);
            fetchPet(); // Refresh data
        } catch (err) {
            console.error('Error deleting vet visit:', err);
            alert('Failed to delete vet visit');
        }
    };

    const handleDeletePet = async () => {
        if (!window.confirm(`Are you sure you want to delete ${pet.name}? This will delete all associated records.`)) {
            return;
        }
        try {
            await petAPI.delete(id);
            navigate('/');
        } catch (err) {
            console.error('Error deleting pet:', err);
            alert('Failed to delete pet');
        }
    };

    if (loading) return <div className="loading">Loading pet details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!pet) return <div className="error">Pet not found</div>;

    return (
        <div className="pet-detail">
            <button onClick={() => navigate('/')} className="back-button">
                ← Back to Pets
            </button>

            <div className="pet-header">
                {pet.photo && (
                    <img
                        src={`http://localhost:8000${pet.photo}`}
                        alt={pet.name}
                        className="pet-photo-large"
                    />
                )}
                <div className="pet-info">
                    <h1>{pet.name}</h1>
                    <p className="species">{pet.species}</p>
                    {pet.breed && <p className="breed">{pet.breed}</p>}
                    {pet.birth_date && (
                        <p className="birth-date">
                            Born: {new Date(pet.birth_date).toLocaleDateString()}
                        </p>
                    )}
                    {pet.notes && (
                        <div className="notes">
                            <h3>Notes</h3>
                            <p>{pet.notes}</p>
                        </div>
                    )}
                    <div className="pet-actions">
                        <button
                            onClick={() => navigate(`/pets/${id}/edit`)}
                            className="edit-pet-button"
                        >
                            Edit Pet
                        </button>
                        <button
                            onClick={handleDeletePet}
                            className="delete-pet-button"
                        >
                            Delete Pet
                        </button>
                    </div>
                </div>
            </div>

            <div className="records-section">
                <div className="record-card">
                    <div className="record-header">
                        <h2>Weight Records</h2>
                        <button
                            onClick={() => navigate(`/pets/${id}/add-weight`)}
                            className="add-record-button"
                        >
                            + Add
                        </button>
                    </div>
                    {pet.weight_records && pet.weight_records.length > 0 ? (
                        <ul>
                            {pet.weight_records.map(record => (
                                <li key={record.id}>
                                    <div className="record-content">
                                        <div>
                                            <strong>{new Date(record.date).toLocaleDateString()}</strong>: {record.weight}{record.unit}
                                            {record.notes && <span className="record-notes"> - {record.notes}</span>}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteWeight(record.id)}
                                            className="delete-button"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-records">No weight records yet</p>
                    )}
                </div>

                <div className="record-card">
                    <div className="record-header">
                        <h2>Vaccinations</h2>
                        <button
                            onClick={() => navigate(`/pets/${id}/add-vaccination`)}
                            className="add-record-button"
                        >
                            + Add
                        </button>
                    </div>
                    {pet.vaccinations && pet.vaccinations.length > 0 ? (
                        <ul>
                            {pet.vaccinations.map(vac => (
                                <li key={vac.id}>
                                    <div className="record-content">
                                        <div>
                                            <strong>{vac.vaccine_name}</strong> - {new Date(vac.date_administered).toLocaleDateString()}
                                            {vac.due_date && (
                                                <span className="due-date"> (Due: {new Date(vac.due_date).toLocaleDateString()})</span>
                                            )}
                                            {vac.veterinarian && <span> - Dr. {vac.veterinarian}</span>}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVaccination(vac.id)}
                                            className="delete-button"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-records">No vaccination records yet</p>
                    )}
                </div>

                <div className="record-card">
                    <div className="record-header">
                        <h2>Vet Visits</h2>
                        <button
                            onClick={() => navigate(`/pets/${id}/add-vet-visit`)}
                            className="add-record-button"
                        >
                            + Add
                        </button>
                    </div>
                    {pet.vet_visits && pet.vet_visits.length > 0 ? (
                        <ul>
                            {pet.vet_visits.map(visit => (
                                <li key={visit.id}>
                                    <div className="record-content">
                                        <div>
                                            <strong>{new Date(visit.date).toLocaleDateString()}</strong> - {visit.reason}
                                            {visit.veterinarian && <span> - Dr. {visit.veterinarian}</span>}
                                            {visit.cost && <span className="cost"> (${visit.cost})</span>}
                                            {visit.notes && <p className="record-notes">{visit.notes}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVetVisit(visit.id)}
                                            className="delete-button"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-records">No vet visit records yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}



export default PetDetail;