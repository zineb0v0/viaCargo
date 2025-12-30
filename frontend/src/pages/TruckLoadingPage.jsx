// src/pages/TruckLoadingPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlay, FaTruck, FaBox, FaExclamationTriangle } from 'react-icons/fa';
import './TruckLoadingPage.css';

// ✅ CORRECTION : Utiliser le port 5000 qui fonctionne
const API_BASE_URL = 'http://localhost:5000/api';
const OPTIMIZE_URL = `${API_BASE_URL}/solution/sac_a_dos`;

const TruckLoadingPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [camionsData, setCamionsData] = useState({});
    const [colisData, setColisData] = useState({});
    const [dataLoaded, setDataLoaded] = useState(false);

    // Charger les données des camions et colis au montage du composant
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            console.log('🔄 Chargement des données initiales...');
            
            // Récupérer les camions - Essayer différents endpoints
            let camionsResponse;
            try {
                // Essai 1 : /camions (pluriel)
                camionsResponse = await axios.get(`${API_BASE_URL}/camions`);
            } catch (err) {
                try {
                    // Essai 2 : /camion (singulier)
                    camionsResponse = await axios.get(`${API_BASE_URL}/camion`);
                } catch (err2) {
                    // Essai 3 : /trucks
                    camionsResponse = await axios.get(`${API_BASE_URL}/trucks`);
                }
            }
            
            const camionsMap = {};
            camionsResponse.data.forEach(camion => {
                camionsMap[camion.id_camion || camion.id] = camion;
            });
            setCamionsData(camionsMap);
            console.log('✅ Camions chargés:', Object.keys(camionsMap).length);

            // Récupérer les colis - Essayer différents endpoints
            let colisResponse;
            try {
                // Essai 1 : /colis
                colisResponse = await axios.get(`${API_BASE_URL}/colis`);
            } catch (err) {
                try {
                    // Essai 2 : /parcels
                    colisResponse = await axios.get(`${API_BASE_URL}/parcels`);
                } catch (err2) {
                    // Essai 3 : /packages
                    colisResponse = await axios.get(`${API_BASE_URL}/packages`);
                }
            }
            
            const colisMap = {};
            colisResponse.data.forEach(colis => {
                colisMap[colis.id_colis || colis.id] = colis;
            });
            setColisData(colisMap);
            console.log('✅ Colis chargés:', Object.keys(colisMap).length);

            setDataLoaded(true);
            setError(null);

        } catch (err) {
            console.error('❌ Erreur lors du chargement des données:', err);
            
            // Message d'erreur plus explicite
            if (err.code === 'ERR_NETWORK') {
                setError(
                    `Impossible de se connecter au serveur backend (${API_BASE_URL}). 
                    Vérifiez que le serveur est bien démarré sur le port 5000.`
                );
            } else {
                setError(`Erreur lors du chargement des données: ${err.message}`);
            }
        }
    };

    // Lancer l'optimisation
    const runOptimization = async () => {
        setIsLoading(true);
        setError(null);
        setOptimizationResult(null);

        try {
            console.log('🚀 Lancement de l\'optimisation...');
            const response = await axios.get(OPTIMIZE_URL);
            const backend = response.data;
            console.log('✅ Résultat reçu:', backend);

            // Convertir backend.repartition en array avec les détails
            const truckAssignments = Object.entries(backend.repartition).map(
                ([truckId, parcelIds]) => {
                    // Récupérer les détails des colis
                    const parcelsDetails = parcelIds.map(colisId =>
                        colisData[colisId] || {
                            id_colis: colisId,
                            poids: 0,
                            nom_client: 'Client inconnu',
                            adresse: 'Adresse non disponible'
                        }
                    );

                    return {
                        truckId,
                        parcels: parcelsDetails
                    };
                }
            );

            setOptimizationResult({
                date_execution: backend.date_execution,
                trucks: truckAssignments
            });

            console.log('✅ Optimisation terminée avec succès');

        } catch (err) {
            console.error('❌ Erreur d\'optimisation:', err);
            
            if (err.code === 'ERR_NETWORK') {
                setError(
                    `Impossible de contacter le serveur d'optimisation. 
                    Vérifiez que le backend est démarré sur le port 5000.`
                );
            } else if (err.response?.status === 401) {
                setError("Erreur d'authentification. Veuillez vous reconnecter.");
            } else {
                setError(
                    `Erreur lors de l'optimisation: ${err.response?.data?.message || err.message}`
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="loading-page">

            <div className="page-header-loading">
                <h2>Chargement des camions</h2>
                <p>Optimisez automatiquement la répartition des colis</p>
            </div>

            {/* Indicateur de chargement initial */}
            {!dataLoaded && !error && (
                <div className="initial-loading">
                    <div className="spinner"></div>
                    <p>Chargement des données...</p>
                </div>
            )}

            {/* BOUTON DE LANCEMENT - CENTRÉ */}
            {dataLoaded && (
                <div className="launch-button-container">
                    <button
                        onClick={runOptimization}
                        className="btn-launch-algorithm"
                        disabled={isLoading || !dataLoaded}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner"></div>
                                Calcul en cours...
                            </>
                        ) : (
                            <>
                                <FaPlay /> Lancer l'optimisation
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* MESSAGE D'ERREUR */}
            {error && (
                <div className="error-message">
                    <FaExclamationTriangle className="error-icon" />
                    <div>
                        <strong>Erreur</strong>
                        <p>{error}</p>
                        <button 
                            onClick={fetchInitialData} 
                            className="btn-retry"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}

            {/* DATE D'EXÉCUTION */}
            {optimizationResult && (
                <div className="execution-info">
                    <strong>Résultats – Exécuté le :</strong> {optimizationResult.date_execution}
                </div>
            )}

            {/* AFFICHAGE DES RÉSULTATS */}
            {optimizationResult && (
                <div className="results-container">
                    {optimizationResult.trucks.map((truck) => {
                        // Récupérer les infos du camion depuis camionsData
                        const camionInfo = camionsData[truck.truckId] || {
                            modele: 'Modèle inconnu',
                            capacite: 50
                        };

                        // Calculer le poids total utilisé
                        const poidsUtilise = truck.parcels.reduce(
                            (sum, colis) => sum + (parseFloat(colis.poids) || 0),
                            0
                        );

                        const pourcentage = (poidsUtilise / camionInfo.capacite) * 100;
                        const isOverloaded = pourcentage > 100;

                        return (
                            <div 
                                key={truck.truckId} 
                                className={`truck-card ${isOverloaded ? 'overloaded' : ''}`}
                            >

                                {/* HEADER CAMION */}
                                <div className="truck-header">
                                    <div className="truck-info">
                                        <FaTruck className="truck-icon" />
                                        <div>
                                            <strong className="truck-id">{truck.truckId}</strong>
                                            <p className="truck-model">{camionInfo.marque || camionInfo.modele}</p>
                                        </div>
                                    </div>
                                    <span className={`truck-capacity ${isOverloaded ? 'overloaded' : ''}`}>
                                        Capacité utilisée<br />
                                        <strong>{poidsUtilise.toFixed(1)} / {camionInfo.capacite} kg</strong>
                                        {isOverloaded && (
                                            <span className="overload-warning">
                                                ⚠️ Surcharge
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* BARRE DE PROGRESSION */}
                                <div className="capacity-bar-container">
                                    <div className="capacity-bar">
                                        <div
                                            className={`capacity-fill ${isOverloaded ? 'overloaded' : ''}`}
                                            style={{ width: `${Math.min(pourcentage, 100)}%` }}
                                        />
                                    </div>
                                    <span className="capacity-percentage">
                                        {pourcentage.toFixed(0)}%
                                    </span>
                                </div>

                                {/* LISTE COLIS */}
                                <h5 className="colis-title">
                                    Colis chargés ({truck.parcels.length})
                                </h5>

                                <div className="colis-list">
                                    {truck.parcels.map((colis) => (
                                        <div key={colis.id_colis} className="colis-card">
                                            <div className="colis-icon-wrapper">
                                                <FaBox className="colis-icon" />
                                            </div>
                                            <div className="colis-info">
                                                <strong className="colis-id">{colis.id_colis}</strong>
                                                <p className="colis-client">
                                                    {colis.nom_client || colis.client_name || 'Client inconnu'}
                                                </p>
                                                <small className="colis-address">
                                                    {colis.adresse || colis.address || 'Adresse non disponible'}
                                                </small>
                                            </div>
                                            <span className="colis-weight">
                                                {parseFloat(colis.poids || 0).toFixed(0)} kg
                                            </span>
                                        </div>
                                    ))}

                                    {truck.parcels.length === 0 && (
                                        <p className="no-colis">Aucun colis chargé dans ce camion.</p>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default TruckLoadingPage;