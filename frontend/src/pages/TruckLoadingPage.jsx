// src/pages/TruckLoadingPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';
import './TruckLoadingPage.css';

const API_BASE_URL = 'http://localhost:5000/api';
const OPTIMIZE_URL = `${API_BASE_URL}/solution/sac_a_dos`;

const TruckLoadingPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [optimizationResult, setOptimizationResult] = useState(null);

    // Lancer l'optimisation en appelant ton backend Flask
    const runOptimization = async () => {
        setIsLoading(true);
        setError(null);
        setOptimizationResult(null);

        try {
            const response = await axios.get(OPTIMIZE_URL);
            const backend = response.data;

            // Convertir backend.repartition (object) → array utilisable par React
            const truckAssignments = Object.entries(backend.repartition).map(
                ([truckId, parcels]) => ({
                    truckId,
                    parcels
                })
            );

            setOptimizationResult({
                date_execution: backend.date_execution,
                trucks: truckAssignments
            });

        } catch (err) {
            console.error(err);
            setError("Erreur lors de la récupération des résultats. Vérifiez si le backend tourne bien.");
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

            {/* BOUTON DE LANCEMENT */}
            <div className="launch-button-container">
                <button
                    onClick={runOptimization}
                    className="btn-launch-algorithm"
                    disabled={isLoading}
                >
                    {isLoading ? "Calcul en cours..." : (<><FaPlay /> Lancer l'optimisation</>)}
                </button>
            </div>

            {/* MESSAGE D'ERREUR */}
            {error && (
                <div className="error-message" style={{ color: "red", marginTop: "10px" }}>
                    {error}
                </div>
            )}

            {/* AFFICHAGE DES RÉSULTATS */}
            {optimizationResult && (
                <div className="optimization-results">
                    <h3>Résultats – Exécuté le : {optimizationResult.date_execution}</h3>

                    {optimizationResult.trucks.map((truck) => (
                        <div key={truck.truckId} className="truck-assignment-card">
                            <h4>Camion : {truck.truckId}</h4>
                            <h5>Colis chargés ({truck.parcels.length})</h5>

                            {truck.parcels.length === 0 ? (
                                <p>Aucun colis chargé dans ce camion.</p>
                            ) : (
                                <ul>
                                    {truck.parcels.map((colisId) => (
                                        <li key={colisId}><strong>Colis :</strong> {colisId}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TruckLoadingPage;
