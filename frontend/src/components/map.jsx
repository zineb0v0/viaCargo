import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes par défaut de Leaflet dans React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Icône spéciale pour le Dépôt (Rouge)
const depotIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapEvents({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

const RouteOptimizerMap = () => {
    const [clients, setClients] = useState([]);
    const [depot, setDepot] = useState(null);
    const [isSelectingDepot, setIsSelectingDepot] = useState(false);

    const handleMapClick = (latlng) => {
        if (isSelectingDepot) {
            setDepot(latlng);
            setIsSelectingDepot(false);
            console.log("Dépôt défini à :", latlng.lat, latlng.lng);
        } else {
            const newClients = [...clients, { id: Date.now(), pos: latlng }];
            setClients(newClients);
            console.log("Client ajouté. Liste actuelle des coordonnées :");
            console.log(newClients.map(c => `${c.pos.lat},${c.pos.lng}`));
        }
    };

    const clearMap = () => {
        setClients([]);
        setDepot(null);
    };

    return (
        <div style={{ padding: "20px", fontFamily: 'Arial' }}>
            <h2>🚀 Test Optimisation de Tournée</h2>
            
            <div style={{ marginBottom: "15px" }}>
                <button 
                    onClick={() => setIsSelectingDepot(true)}
                    style={{ backgroundColor: isSelectingDepot ? 'red' : '#f0f0f0', padding: '10px', marginRight: '10px' }}
                >
                    {isSelectingDepot ? "Cliquez sur la carte pour le Dépôt" : "📍 Définir le Dépôt"}
                </button>
                <button onClick={clearMap} style={{ padding: '10px' }}>🗑️ Tout effacer</button>
            </div>

            <div style={{ height: "500px", width: "100%", borderRadius: "10px", overflow: "hidden", border: "2px solid #333" }}>
                <MapContainer center={[33.5731, -7.5898]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    
                    <MapEvents onMapClick={handleMapClick} />

                    {/* Affichage du Dépôt */}
                    {depot && (
                        <Marker position={depot} icon={depotIcon}>
                            <Popup>🏠 Dépôt (Départ/Arrivée)</Popup>
                        </Marker>
                    )}

                    {/* Affichage des Clients */}
                    {clients.map((client) => (
                        <Marker key={client.id} position={client.pos}>
                            <Popup>📦 Client {client.id}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div style={{ marginTop: "15px", backgroundColor: "#f9f9f9", padding: "10px" }}>
                <h4>Données prêtes pour le Recuit Simulé :</h4>
                <p><b>Dépôt :</b> {depot ? `${depot.lat}, ${depot.lng}` : "Non défini"}</p>
                <p><b>Nombre de clients :</b> {clients.length}</p>
            </div>
        </div>
    );
};

export default RouteOptimizerMap;