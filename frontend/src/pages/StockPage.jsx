import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaSearch, FaEdit, FaTrashAlt, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import PackageForm from '../components/PackageForm';
import './StockPage.css';

const API_URL = 'http://localhost:5000/api/colis/';

const StockPage = () => {
    // --- STATES ---
    const [packageData, setPackageData] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packageToEdit, setPackageToEdit] = useState(null);

    // --- FONCTIONS UTILITAIRES ---
    
    // 1. Fonction pour adapter les données backend -> frontend
    const adaptBackendToFrontend = (backendData) => {
        return backendData.map(colis => ({
            id: colis.id_colis,
            nom_client: colis.nom_client, // ✅ Garder nom_client
            address: colis.destination,
            weight: colis.poids,
            deadline: colis.date_livraison,
            status: colis.statut,
            // Conserver les données originales pour l'édition
            backendData: colis
        }));
    };

    // 2. Récupérer les colis depuis l'API
    const fetchPackages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            console.log("Données reçues du backend:", response.data); // 🔍 Debug
            const adaptedData = adaptBackendToFrontend(response.data);
            console.log("Données adaptées:", adaptedData); // 🔍 Debug
            setPackageData(adaptedData);
        } catch (err) {
            console.error("Erreur de récupération:", err);
            setError("Erreur de connexion à l'API. Vérifiez que le backend est démarré sur http://localhost:5000");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Gestion du formulaire (ajout/édition)
    const handleFormSubmit = async (formData) => {
        console.log("📤 Données envoyées au backend:", formData); // 🔍 Debug
        setIsModalOpen(false);
        try {
            // Adapter les données frontend -> backend
            const backendData = {
                nom_client: formData.nom_client, // ✅ CORRECTION ICI
                destination: formData.address,
                poids: parseFloat(formData.weight),
                date_livraison: formData.deadline,
                statut: formData.status || 'en_stock'
            };

            console.log("📦 backendData préparé:", backendData); // 🔍 Debug

            if (packageToEdit && packageToEdit.backendData) {
                // Édition - utiliser l'ID du colis du backend
                const response = await axios.put(`${API_URL}${packageToEdit.backendData.id_colis}`, backendData);
                console.log("✅ Réponse PUT:", response.data); // 🔍 Debug
            } else {
                // Création
                const response = await axios.post(API_URL, backendData);
                console.log("✅ Réponse POST:", response.data); // 🔍 Debug
            }
            
            alert(`Opération réussie !`);
            fetchPackages(); // Recharger les données
        } catch (err) {
            console.error("❌ Erreur:", err); // 🔍 Debug
            alert(`Erreur : ${err.response?.data?.error || err.message}`);
        }
    };

    // 4. Suppression d'un colis
    const handleDeleteClick = async (packageId) => {
        if (window.confirm(`Voulez-vous vraiment supprimer le colis ${packageId} ?`)) {
            try {
                await axios.delete(`${API_URL}${packageId}`);
                alert(`Colis ${packageId} supprimé.`);
                fetchPackages(); // Recharger les données
            } catch (err) {
                alert(`Erreur : ${err.response?.data?.error || err.message}`);
            }
        }
    };

    // 5. Affichage du statut
    const renderStatusBadge = (status) => {
        let className = 'status-badge';
        let statusText = status;
        
        if (status === 'en_stock' || status === 'En attente') {
            className += ' status-pending';
            statusText = 'En attente';
        } else if (status === 'livre' || status === 'Livré') {
            className += ' status-delivered';
            statusText = 'Livré';
        } else if (status === 'en_livraison') {
            className += ' status-delivery';
            statusText = 'En livraison';
        }
        return <span className={className}>{statusText}</span>;
    };

    // 6. Formatage de la date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return dateString; 
        }
    };

    // 7. Ouvrir le formulaire d'ajout
    const handleAddClick = () => { 
        setPackageToEdit(null);
        setIsModalOpen(true);
    };

    // 8. Ouvrir le formulaire d'édition
    const handleEditClick = (pkg) => { 
        console.log("📝 Édition du colis:", pkg); // 🔍 Debug
        setPackageToEdit(pkg);
        setIsModalOpen(true);
    };

    // --- EFFETS ---
    useEffect(() => {
        fetchPackages();
    }, []);

    // --- FILTRAGE DES DONNÉES ---
    const filteredPackages = packageData.filter(pkg => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();

        return (
            (pkg.id && pkg.id.toString().toLowerCase().includes(lowerSearch)) ||
            (pkg.nom_client && pkg.nom_client.toLowerCase().includes(lowerSearch)) ||
            (pkg.address && pkg.address.toLowerCase().includes(lowerSearch))
        );
    });

    // --- RENDU CONDITIONNEL (chargement/erreur) ---
    if (isLoading) {
        return <div className="loading-state" style={{padding: '30px', fontSize: '1.2em'}}>
            Chargement des données de stock...
        </div>;
    }

    if (error) {
        return <div className="error-state" style={{padding: '30px', color: 'red'}}>
            Erreur : {error}
        </div>;
    }

    // --- RENDU PRINCIPAL ---
    return (
        <div className="stock-page">
            {/* Formulaire modal */}
            <PackageForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleFormSubmit} 
                packageToEdit={packageToEdit}
            />
            
            {/* En-tête de page */}
            <div className="page-header-stock">
                <div>
                    <h2>Gestion de stock</h2>
                    <p>Gérez vos colis et commandes</p>
                </div>
                <button className="btn-add-package" onClick={handleAddClick}>
                    <FaPlus /> Ajouter un colis
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="search-bar-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Rechercher par numéro, client ou adresse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            
            {/* Tableau des colis */}
            <div className="data-table-container-stock">
                <table className="data-table-stock">
                    <thead>
                        <tr>
                            <th>N° Colis</th>
                            <th>Nom du client</th>
                            <th>Adresse de livraison</th>
                            <th>Poids</th>
                            <th>Date limite</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPackages.map((pkg) => (
                            <tr key={pkg.id}>
                                <td>{pkg.id}</td>
                                <td>{pkg.nom_client}</td>
                                <td className="col-address-stock">
                                    <FaMapMarkerAlt size={12} color="#9e84b8" style={{ marginRight: '5px' }} />
                                    {pkg.address}
                                </td>
                                <td><span className="weight-badge-stock">{pkg.weight} kg</span></td>
                                <td className="col-deadline-stock">
                                    <FaCalendarAlt size={12} color="#9e84b8" style={{ marginRight: '5px' }} />
                                    {formatDate(pkg.deadline)}
                                </td>
                                <td>{renderStatusBadge(pkg.status)}</td>
                                <td className="col-actions">
                                    <button 
                                        onClick={() => handleEditClick(pkg)} 
                                        className="action-btn edit-btn"
                                        title="Modifier"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(pkg.id)} 
                                        className="action-btn delete-btn"
                                        title="Supprimer"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        
                        {filteredPackages.length === 0 && (
                            <tr>
                                <td colSpan="7" className="no-data-cell">
                                    {searchTerm 
                                        ? "Aucun colis ne correspond à la recherche." 
                                        : "Aucun colis en stock."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockPage;