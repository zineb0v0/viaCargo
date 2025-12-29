import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from app import app
from models import db, Colis, Depot, Client

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
        depots = Depot.query.filter(Depot.latitude.is_(None)).all()
        for d in depots:
            lat, lon = get_coordinates(d.adresse)
            if lat:
                d.latitude, d.longitude = lat, lon
                print(f"Dépôt {d.nom} localisé : {lat}, {lon}")
        
        clients = Client.query.filter(Client.latitude.is_(None)).all()
        for cl in clients:
            lat, lon = get_coordinates(cl.adresse)
            if lat:
                cl.latitude, cl.longitude = lat, lon
                print(f"Client {cl.nom} localisé : {lat}, {lon}")
            time.sleep(1)

        colis_list = Colis.query.filter(Colis.latitude.is_(None)).all()
        for c in colis_list:
            lat, lon = get_coordinates(c.destination)
            if lat:
                c.latitude, c.longitude = lat, lon
                print(f"Colis #{c.id_colis} localisé : {lat}, {lon}")
            time.sleep(1) 
            
        db.session.commit()
        print("Mise à jour globale (Dépôts, Clients, Colis) réussie.")

if __name__ == "__main__":
    run_geocoding()