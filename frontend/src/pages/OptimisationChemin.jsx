// src/pages/OptimisationChemin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRoute, FaSpinner } from "react-icons/fa";
import "./OptimisationChemin.css";

const API_TOURNEE = "http://localhost:5000/api/tournee";
const API_CAMIONS = "http://localhost:5000/api/camions";

const OptimisationChemin = () => {
    const [camions, setCamions] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedCamion, setSelectedCamion] = useState(null);
    const [tournee, setTournee] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState("");

    /* ================================
       CHARGEMENT INITIAL
    ================================= */
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        console.log("🔄 Chargement des données...");
        setError("");
        setIsLoadingData(true);

        try {
            // Charger les clients et camions en parallèle
            const [clientsRes, camionsRes] = await Promise.all([
                axios.get(`${API_TOURNEE}/clients`, { withCredentials: true })
                    .catch(err => {
                        console.error("❌ Erreur clients:", err.message);
                        return { data: [] };
                    }),
                axios.get(API_CAMIONS, { withCredentials: true })
                    .catch(err => {
                        console.error("❌ Erreur camions:", err.message);
                        return { data: [] };
                    })
            ]);

            console.log("✅ Clients reçus :", clientsRes.data);
            console.log("✅ Camions reçus :", camionsRes.data);

            setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
            setCamions(Array.isArray(camionsRes.data) ? camionsRes.data : []);

            if (!Array.isArray(camionsRes.data) || camionsRes.data.length === 0) {
                setError("⚠️ Aucun camion disponible. Vérifiez que des camions sont enregistrés dans la base de données.");
            }

        } catch (err) {
            console.error("❌ Erreur générale:", err);
            setError("❌ Erreur lors du chargement des données");
        } finally {
            setIsLoadingData(false);
        }
    };

    /* ================================
       LANCER LE RECUIT SIMULÉ
    ================================= */
    const lancerOptimisation = async () => {
        if (!selectedCamion) {
            setError("⚠️ Veuillez sélectionner un camion");
            return;
        }

        if (clients.length === 0) {
            setError("⚠️ Aucun client disponible pour l'optimisation");
            return;
        }

        setIsLoading(true);
        setError("");
        setTournee(null);

        try {
            console.log("🚀 Lancement optimisation camion :", selectedCamion);
            console.log("📍 Clients disponibles:", clients.length);

            const res = await axios.post(
                `${API_TOURNEE}/optimize/${selectedCamion}`,
                {},
                {
                    withCredentials: true,
                    timeout: 30000
                }
            );

            console.log("🎯 Résultat tournée :", res.data);

            if (res.data && res.data.id_tournee) {
                setTournee(res.data);
                setError("");
            } else {
                setError("❌ Format de réponse invalide du serveur");
                console.error("Format de réponse invalide:", res.data);
            }
        } catch (err) {
            console.error("❌ Erreur optimisation:", err);

            if (err.code === 'ECONNABORTED') {
                setError("❌ Le serveur met trop de temps à répondre (timeout)");
            } else if (err.response?.status === 404) {
                setError("❌ Endpoint d'optimisation introuvable (404)");
            } else if (err.response?.status === 401) {
                setError("❌ Erreur d'authentification. Reconnectez-vous.");
            } else if (err.response?.status === 500) {
                const errorMsg = err.response?.data?.error || "Erreur serveur interne";
                setError(`❌ Erreur serveur: ${errorMsg}`);
            } else {
                const errorMsg = err.response?.data?.error || err.message || "Erreur lors de l'optimisation";
                setError(`❌ ${errorMsg}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ================================
       RENDER
    ================================= */
    return (
        <div className="optimisation-chemin-page">

            {/* HEADER */}
            <div className="page-header-optimisation">
                <FaRoute className="header-icon-optimisation" />
                <div>
                    <h2>Optimisation Chemin</h2>
                    <p>Sélectionnez un camion et lancez l'optimisation</p>
                </div>
            </div>

            {/* FORMULAIRE */}
            <div className="optimisation-form-container">
                <div className="form-section">
                    <label htmlFor="camion-select">Sélectionner un camion</label>
                    <select
                        id="camion-select"
                        className="camion-select-input"
                        value={selectedCamion || ""}
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            console.log("🚚 Camion sélectionné:", value);
                            setSelectedCamion(value);
                            setError("");
                        }}
                        disabled={isLoading || isLoadingData || camions.length === 0}
                    >
                        <option value="">-- Choisir un camion --</option>
                        {camions.length > 0 ? (
                            camions.map((camion) => (
                                <option key={camion.id_camion} value={camion.id_camion}>
                                    {camion.nom_camion || camion.marque || `Camion ${camion.id_camion}`}
                                    {camion.capacite && ` (${camion.capacite} kg)`}
                                </option>
                            ))
                        ) : (
                            <option disabled>Aucun camion disponible</option>
                        )}
                    </select>
                </div>

                <button
                    onClick={lancerOptimisation}
                    disabled={isLoading || isLoadingData || !selectedCamion}
                    className="btn-optimisation-launch"
                >
                    {isLoading ? (
                        <>
                            <FaSpinner className="spinner-rotate" />
                            Optimisation en cours...
                        </>
                    ) : (
                        <>
                            <FaRoute />
                            Lancer l'optimisation
                        </>
                    )}
                </button>
            </div>

            {/* ERREUR */}
            {error && (
                <div className="error-box-optimisation">
                    {error}
                </div>
            )}

            {/* CHARGEMENT */}
            {isLoadingData && (
                <div className="loading-indicator">
                    <FaSpinner className="spinner-rotate" />
                    <p>Chargement des données...</p>
                </div>
            )}

            {/* RÉSULTATS */}
            {tournee && (
                <div className="results-box-optimisation">
                    <h3 className="results-title-optimisation">Résultats de l'optimisation</h3>

                    <div className="result-item">
                        <span className="result-label">ID Tournée</span>
                        <span className="result-value">{tournee.id_tournee}</span>
                    </div>

                    <div className="result-item">
                        <span className="result-label">Camion</span>
                        <span className="result-value">{tournee.camion_id}</span>
                    </div>

                    {tournee.distance_totale !== undefined && (
                        <div className="result-item">
                            <span className="result-label">Distance totale</span>
                            <span className="result-value">{tournee.distance_totale.toFixed(2)} km</span>
                        </div>
                    )}

                    {tournee.temps_estime !== undefined && (
                        <div className="result-item">
                            <span className="result-label">Temps estimé</span>
                            <span className="result-value">{tournee.temps_estime.toFixed(2)} h</span>
                        </div>
                    )}

                    {tournee.ordre_clients && Array.isArray(tournee.ordre_clients) && tournee.ordre_clients.length > 0 && (
                        <div className="clients-order-section">
                            <h4>Ordre de visite</h4>
                            <div className="clients-order-list">
                                {tournee.ordre_clients.map((clientId, index) => (
                                    <div key={index} className="client-order-item">
                                        <span className="client-number">{index + 1}</span>
                                        <span className="client-name">Client {clientId}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default OptimisationChemin;