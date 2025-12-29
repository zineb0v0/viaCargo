import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GiCube } from 'react-icons/gi';
import './DashboardPage.css';

const API_URL = 'http://localhost:5000/api/colis'; 

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
    const [assignments, setAssignments] = useState([]);
    const [runs, setRuns] = useState([]);
    const [expandedRun, setExpandedRun] = useState(null);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            const data = response.data || [];

            // Backend returns a list of colis objects. Compute stats and store packages.
            const packages = data;
            setPackageData(packages);
            setStats({
                totalPackages: packages.length,
                totalWeight: packages.reduce((sum, p) => sum + (p.poids || 0), 0)
            });
        } catch (err) {
            console.error("Erreur Dashboard:", err);
            setError("Impossible de charger le tableau de bord. Backend éteint ou erreur CORS.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments/');
            const data = res.data || [];

            // Now the backend returns runs grouped by run_id with aggregated info
            setRuns(data);

            // Also flatten assignments for any other uses (optional)
            const flat = [];
            data.forEach(r => r.assignments.forEach(a => flat.push(a)));
            setAssignments(flat);
        } catch (err) {
            console.error("Erreur fetch assignments:", err);
        }
    };

    const toggleRun = (runKey) => {
        setExpandedRun(expandedRun === runKey ? null : runKey);
    };
    
    useEffect(() => {
        fetchDashboardData();
        fetchAssignments();
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
        return <div className="loading-state" style={{padding: '30px', fontSize: '1.2em'}}>Chargement des données du tableau de bord...</div>;
    }

    if (error) {
        return <div className="error-state" style={{padding: '30px', color: 'red'}}>Erreur : {error}</div>;
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
            
            <div className="history-section">
                <h3>Historique des affectations</h3>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Camions</th>
                                <th>Nb colis</th>
                                <th>Poids total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runs.map((run) => {
                                const key = run.run_id ?? run.executed_at;
                                return (
                                    <React.Fragment key={key}>
                                        <tr className="run-row">
                                            <td>{run.executed_at ? new Date(run.executed_at).toLocaleString() : 'N/A'}</td>
                                            <td>{(run.camions || []).join(', ')}</td>
                                            <td>{run.num_colis}</td>
                                            <td>{run.total_weight} kg</td>
                                            <td>
                                                <button className="btn-link" onClick={() => toggleRun(key)}>
                                                    {expandedRun === key ? 'Masquer' : 'Détails'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRun === key && (
                                            <tr className="run-details-row">
                                                <td colSpan="5">
                                                    <div className="run-details">
                                                        <table className="data-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Date</th>
                                                                    <th>Camion</th>
                                                                    <th>Colis</th>
                                                                    <th>Client</th>
                                                                    <th>Poids</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {run.assignments.map((a) => (
                                                                    <tr key={a.id_assignment}>
                                                                        <td>{new Date(a.time).toLocaleString()}</td>
                                                                        <td>{a.camion?.id_camion ?? a.id_camion}</td>
                                                                        <td>{a.colis?.id_colis ?? a.id_colis}</td>
                                                                        <td>{a.colis?.nom_client ?? ''}</td>
                                                                        <td>{a.colis?.poids ?? ''} kg</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {runs.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
                                        Aucun historique d'affectation trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                                <tr key={pkg.id_colis}>
                                    <td className="col-id">{pkg.id_colis}</td>
                                    <td>{pkg.nom_client}</td>
                                    <td className="col-address">
                                        <FaMapMarkerAlt size={12} color="#9e84b8" style={{ marginRight: '5px' }} />
                                        {pkg.destination}
                                    </td>
                                    <td className="col-deadline">{formatDate(pkg.date_livraison)}</td>
                                    <td className="col-weight">
                                        <span className="weight-badge">{pkg.poids} kg</span>
                                    </td>
                                </tr>
                            ))}
                            {packageData.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
                                        Aucun colis trouvé ou en attente.
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