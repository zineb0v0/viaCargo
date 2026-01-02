import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRoute, FaSpinner } from "react-icons/fa";
import "./OptimisationChemin.css";

const API_TOURNEE = "http://localhost:5000/api/tournee";
const API_CAMIONS = "http://localhost:5000/api/camions";
const API_COLIS = "http://localhost:5000/api/colis";

const OptimisationChemin = () => {
    const [camions, setCamions] = useState([]);
    const [colisMap, setColisMap] = useState({}); // Pour faire la correspondance ID -> Nom Client
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
        setError("");
        setIsLoadingData(true);

        try {
            // Charger les camions et les détails des colis en parallèle
            const [camionsRes, colisRes] = await Promise.all([
                axios.get(API_CAMIONS),
                axios.get(API_COLIS)
            ]);

            setCamions(Array.isArray(camionsRes.data) ? camionsRes.data : []);
            
            // Création d'un dictionnaire pour retrouver le nom du client via l'ID du colis
            const map = {};
            colisRes.data.forEach(c => {
                map[c.id_colis] = c.nom_client;
            });
            setColisMap(map);

        } catch (err) {
            setError("❌ Erreur lors du chargement des données");
        } finally {
            setIsLoadingData(false);
        }
    };

    /* ================================
       LANCER LE RECUIT SIMULÉ (TSP)
    ================================= */
    const lancerOptimisation = async () => {
        if (!selectedCamion) {
            setError("⚠️ Veuillez sélectionner un camion");
            return;
        }

        setIsLoading(true);
        setError("");
        setTournee(null);

        try {
            // Appel à votre route backend qui filtre par sac à dos
            const res = await axios.post(
                `${API_TOURNEE}/optimize/${selectedCamion}`,
                {}
            );

            if (res.data && res.data.id_tournee) {
                setTournee(res.data);
            } else {
                setError("❌ Format de réponse invalide");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Erreur lors de l'optimisation";
            setError(`❌ ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="optimisation-chemin-page">

            {/* HEADER - Gardé tel quel */}
            <div className="page-header-optimisation">
                <FaRoute className="header-icon-optimisation" />
                <div>
                    <h2>Optimisation Chemin</h2>
                    <p>Sélectionnez un camion et lancez l'optimisation</p>
                </div>
            </div>

            {/* FORMULAIRE - Gardé tel quel */}
            <div className="optimisation-form-container">
                <div className="form-section">
                    <label htmlFor="camion-select">Sélectionner un camion</label>
                    <select
                        id="camion-select"
                        className="camion-select-input"
                        value={selectedCamion || ""}
                        onChange={(e) => setSelectedCamion(e.target.value ? Number(e.target.value) : null)}
                        disabled={isLoading || isLoadingData}
                    >
                        <option value="">-- Choisir un camion --</option>
                        {camions.map((camion) => (
                            <option key={camion.id_camion} value={camion.id_camion}>
                                {camion.marque || `Camion ${camion.id_camion}`} ({camion.capacite} kg)
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={lancerOptimisation}
                    disabled={isLoading || !selectedCamion}
                    className="btn-optimisation-launch"
                >
                    {isLoading ? (
                        <>
                            <FaSpinner className="spinner-rotate" /> Optimisation...
                        </>
                    ) : (
                        <>
                            <FaRoute /> Lancer l'optimisation
                        </>
                    )}
                </button>
            </div>

            {error && <div className="error-box-optimisation">{error}</div>}

            {/* RÉSULTATS - Structure originale avec logique "Dépôt" */}
            {tournee && (
                <div className="results-box-optimisation">
                    <h3 className="results-title-optimisation">Résultats de l'optimisation</h3>

                    <div className="result-item">
                        <span className="result-label">ID Tournée</span>
                        <span className="result-value">{tournee.id_tournee}</span>
                    </div>

                    <div className="result-item">
                        <span className="result-label">Distance totale</span>
                        <span className="result-value">{tournee.distance_totale.toFixed(2)} km</span>
                    </div>

                    <div className="result-item">
                        <span className="result-label">Temps estimé</span>
                        <span className="result-value">{tournee.temps_estime.toFixed(2)} h</span>
                    </div>

                    {tournee.ordre_clients && (
                        <div className="clients-order-section">
                            <h4>Ordre de visite</h4>
                            <div className="clients-order-list">
                                {tournee.ordre_clients.map((id, index) => (
                                    <div key={index} className="client-order-item">
                                        <span className="client-number">{index + 1}</span>
                                        <span className="client-name">
                                            {id === "DEPOT" ? (
                                                <strong>Dépôt Principal</strong>
                                            ) : (
                                                colisMap[id] || `Colis #${id}`
                                            )}
                                        </span>
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