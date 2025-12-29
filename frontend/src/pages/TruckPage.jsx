import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrashAlt, FaPlus, FaCheckCircle, FaExclamationCircle, FaTruck } from 'react-icons/fa';
import TruckForm from '../components/TruckForm';
import './TruckPage.css';

const API_URL = 'http://localhost:5000/api/camions/';

const TruckPage = () => {
    const [truckData, setTruckData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [truckToEdit, setTruckToEdit] = useState(null);

    // Fonction pour adapter les données backend -> frontend
    const adaptBackendToFrontend = (backendData) => {
        return backendData.map(camion => ({
            id: camion.id_camion,
            id_camion: camion.id_camion,
            marque: camion.marque,
            brand: camion.marque, // Pour compatibilité
            capacite: camion.capacite,
            capacity: camion.capacite, // Pour compatibilité
            status: camion.status,
            backendData: camion // Garder les données originales
        }));
    };

    const fetchTrucks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            console.log("Données API camions:", response.data); // Debug
            const adaptedData = adaptBackendToFrontend(response.data);
            setTruckData(adaptedData);
        } catch (err) {
            console.error("Erreur de récupération des camions:", err);
            setError("Impossible de charger les camions. Vérifiez la route API.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrucks();
    }, []);

    const handleFormSubmit = async (formData) => {
        setIsModalOpen(false);
        try {
            // Préparer les données pour le backend
            const backendData = {
                marque: formData.marque,
                capacite: parseFloat(formData.capacite),
                status: formData.status || 'disponible'
            };

            console.log("Envoi au backend:", backendData); // Debug

            if (truckToEdit && truckToEdit.backendData) {
                // Édition - utiliser l'ID du backend
                await axios.put(`${API_URL}${truckToEdit.backendData.id_camion}`, backendData);
            } else {
                // Création
                await axios.post(API_URL, backendData);
            }
            
            alert(`Opération réussie !`);
            fetchTrucks();
        } catch (err) {
            console.error("Erreur détaillée:", err.response?.data);
            alert(`Erreur : ${err.response?.data?.error || err.message}`);
        }
    };

    const handleDeleteClick = async (truckId) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le camion ${truckId} ?`)) {
            try {
                await axios.delete(`${API_URL}${truckId}`);
                alert(`Camion ${truckId} supprimé.`);
                fetchTrucks();
            } catch (err) {
                alert(`Erreur : ${err.response?.data?.error || err.message}`);
            }
        }
    };
    
    const renderStatus = (status) => {
        let icon = null;
        let className = 'status-badge';
        let statusText = status;
        
        if (status === 'disponible' || status === 'Disponible') {
            icon = <FaCheckCircle size={14} style={{ marginRight: '5px' }} />;
            className += ' status-available';
            statusText = 'Disponible';
        } else if (status === 'hors_service' || status === 'En panne') {
            icon = <FaExclamationCircle size={14} style={{ marginRight: '5px' }} />;
            className += ' status-broken'; 
            statusText = 'Hors service';
        } else if (status === 'en_livraison') {
             icon = <FaTruck size={14} style={{ marginRight: '5px' }} />;
             className += ' status-loading';
             statusText = 'En livraison';
        }

        return <span className={className}>{icon}{statusText}</span>;
    };

    const handleAddClick = () => { 
        setTruckToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (truck) => { 
        setTruckToEdit(truck);
        setIsModalOpen(true);
    };

    const filteredTrucks = truckData.filter(truck => {
        if (!searchTerm) return true; 
        const lowerSearch = searchTerm.toLowerCase();

        return (
            (truck.id && String(truck.id).toLowerCase().includes(lowerSearch)) ||
            (truck.marque && truck.marque.toLowerCase().includes(lowerSearch)) ||
            (truck.status && truck.status.toLowerCase().includes(lowerSearch))
        );
    });

    if (isLoading) {
        return <div className="loading-state">Chargement de la flotte de camions...</div>;
    }

    if (error) {
        return <div className="error-state">Erreur : {error}</div>;
    }

    return (
        <div className="truck-page">
            <TruckForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                truckToEdit={truckToEdit}
            />
            
            <div className="page-header-truck">
                <div>
                    <h2>Gestion de camion</h2>
                    <p>Gérez votre flotte de véhicules</p>
                </div>
                <button className="btn-add-truck" onClick={handleAddClick}>
                    <FaPlus /> Ajouter un camion
                </button>
            </div>

            <div className="search-bar-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher par numéro ou marque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            
            <div className="data-table-container-truck">
                <table className="data-table-truck">
                    <thead>
                        <tr>
                            <th>Numéro</th>
                            <th>Marque</th>
                            <th>Capacité</th>
                            <th>État</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrucks.map((truck) => (
                            <tr key={truck.id}>
                                <td>{truck.id}</td>
                                <td>{truck.marque || truck.brand}</td>
                                <td>
                                    <span className="capacity-badge">
                                        {truck.capacite || truck.capacity} kg
                                    </span>
                                </td>
                                <td>{renderStatus(truck.status)}</td>
                                <td className="col-actions">
                                    <button 
                                        onClick={() => handleEditClick(truck)} 
                                        className="action-btn edit-btn"
                                        title="Modifier"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(truck.id)} 
                                        className="action-btn delete-btn"
                                        title="Supprimer"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredTrucks.length === 0 && (
                            <tr>
                                <td colSpan="5" className="no-data-cell">
                                    {searchTerm 
                                        ? "Aucun camion ne correspond à la recherche." 
                                        : "Aucun camion trouvé dans la flotte."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TruckPage;