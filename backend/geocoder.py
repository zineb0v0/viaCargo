import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from app import app
from models import db, Client, Depot

# Initialisation du géocodeur
geolocator = Nominatim(user_agent="viacargo_app")

def get_coordinates(address):
    try:
        location = geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
    except GeocoderTimedOut:
        return get_coordinates(address)
    return None, None

def run_geocoding():
    with app.app_context():
        # 1. Géocodage des Dépôts
        depots = Depot.query.filter(Depot.latitude.is_(None)).all()
        for d in depots:
            lat, lon = get_coordinates(d.adresse)
            if lat:
                d.latitude, d.longitude = lat, lon
                print(f"Dépôt {d.nom} localisé : {lat}, {lon}")
        
        # 2. Géocodage des Clients
        clients = Client.query.filter(Client.latitude.is_(None)).all()
        for c in clients:
            lat, lon = get_coordinates(c.adresse)
            if lat:
                c.latitude, c.longitude = lat, lon
                print(f"Client {c.nom} localisé : {lat}, {lon}")
            # Respecter la limite de Nominatim (1 requête par seconde)
            time.sleep(1) 
            
        db.session.commit()
        print("Mise à jour de la base de données réussie.")

if __name__ == "__main__":
    run_geocoding()