import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GiCube } from 'react-icons/gi';
import './DashboardPage.css';

const API_URL = 'http://localhost:5000/api/colis/';

const renderStatCard = (title, value, isKg = false) => (
    <div className="stats-card">
        <div className="card-content">
            <p className="card-title">{title}</p>
            <p className="card-value">{value}{isKg ? ' kg' : ''}</p>
        </div>
        <GiCube size={40} className="card-icon" /> 
    </div>
);

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalPackages: 0, totalWeight: 0 });
    const [packageData, setPackageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL, {
                withCredentials: true
            });
            
            const colisData = response.data || [];
            
            const totalPackages = colisData.length;
            const totalWeight = colisData.reduce((sum, colis) => sum + (colis.poids || 0), 0);
            
            const packages = colisData.map(colis => ({
                id: colis.id_colis,
                client: colis.nom_client || 'Client inconnu',
                address: colis.destination,
                deadline: colis.date_livraison,
                weight: colis.poids
            }));

            setPackageData(packages);
            setStats({
                totalPackages: totalPackages,
                totalWeight: totalWeight.toFixed(2)
            });
        } catch (err) {
            console.error("Erreur Dashboard:", err);
            setError(`Impossible de charger les données: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchDashboardData();
    }, []);

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

    if (isLoading) {
        return <div className="loading-state" style={{padding: '30px', fontSize: '1.2em'}}>Chargement...</div>;
    }

    if (error) {
        return (
            <div className="error-state" style={{padding: '30px', color: 'red'}}>
                <h3>Erreur</h3>
                <p>{error}</p>
                <button onClick={fetchDashboardData}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Tableau de bord</h2>
            </div>

            <div className="stats-container">
                {renderStatCard("Colis en attente", stats.totalPackages)} 
                {renderStatCard("Poids total", stats.totalWeight, true)} 
            </div>
            
            <div className="table-section">
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header-row">
                                <th>N° Colis</th>
                                <th>Client</th>
                                <th>Adresse de livraison</th>
                                <th>Date limite</th>
                                <th>Poids</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {packageData.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td className="col-id">{pkg.id}</td>
                                    <td>{pkg.client}</td>
                                    <td className="col-address">
                                        <FaMapMarkerAlt size={12} color="#9e84b8" style={{ marginRight: '5px' }} />
                                        {pkg.address}
                                    </td>
                                    <td className="col-deadline">{formatDate(pkg.deadline)}</td>
                                    <td className="col-weight">
                                        <span className="weight-badge">{pkg.weight} kg</span>
                                    </td>
                                </tr>
                            ))}
                            {packageData.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        Aucun colis trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;