from flask import Flask, request, jsonify, session
from flask_cors import CORS
import math
import random
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'dev-secret-key'

# Données de test
ADMINS = {
    'admin@viacargo.com': 'admin123',
    'manager@viacargo.com': 'manager123'
}

# Clients avec coordonnées GPS réelles du Maroc
CLIENTS = [
    {'id_client': 1, 'nom': 'Client Casablanca', 'adresse': 'Casablanca Centre', 'latitude': 33.5731, 'longitude': -7.5898},
    {'id_client': 2, 'nom': 'Client Rabat', 'adresse': 'Rabat Agdal', 'latitude': 34.0209, 'longitude': -6.8416},
    {'id_client': 3, 'nom': 'Client Marrakech', 'adresse': 'Marrakech Gueliz', 'latitude': 31.6295, 'longitude': -7.9811},
    {'id_client': 4, 'nom': 'Client Tanger', 'adresse': 'Tanger Ville', 'latitude': 35.7595, 'longitude': -5.8340},
    {'id_client': 5, 'nom': 'Client Fès', 'adresse': 'Fès Médina', 'latitude': 34.0181, 'longitude': -5.0078},
    {'id_client': 6, 'nom': 'Client Agadir', 'adresse': 'Agadir Marina', 'latitude': 30.4278, 'longitude': -9.5981}
]

CAMIONS = [
    {'id_camion': 1, 'marque': 'Mercedes', 'capacite': 10.0, 'status': 'disponible'},
    {'id_camion': 2, 'marque': 'Volvo', 'capacite': 15.0, 'status': 'disponible'},
    {'id_camion': 3, 'marque': 'Scania', 'capacite': 20.0, 'status': 'disponible'}
]

TOURNEES = []

def calculate_distance_gps(lat1, lon1, lat2, lon2):
    """Calcule la distance entre deux points GPS (formule haversine)"""
    R = 6371  # Rayon de la Terre en km
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def simulated_annealing_tsp(distance_matrix, cities, initial_temp=1000, cooling_rate=0.95, min_temp=1):
    """Algorithme de recuit simulé pour résoudre le TSP"""
    
    # Solution initiale aléatoire
    current_route = cities.copy()
    random.shuffle(current_route)
    
    def calculate_total_distance(route):
        total = 0
        for i in range(len(route)):
            from_city = route[i]
            to_city = route[(i + 1) % len(route)]  # Retour au point de départ
            total += distance_matrix[from_city][to_city]
        return total
    
    def swap_cities(route):
        """Échange deux villes aléatoirement"""
        new_route = route.copy()
        i, j = random.sample(range(len(route)), 2)
        new_route[i], new_route[j] = new_route[j], new_route[i]
        return new_route
    
    current_distance = calculate_total_distance(current_route)
    best_route = current_route.copy()
    best_distance = current_distance
    
    temperature = initial_temp
    iterations = 0
    
    print(f"Démarrage recuit simulé - Distance initiale: {current_distance:.2f} km")
    
    while temperature > min_temp and iterations < 10000:
        # Générer une nouvelle solution (voisinage)
        new_route = swap_cities(current_route)
        new_distance = calculate_total_distance(new_route)
        
        # Critère d'acceptation
        if new_distance < current_distance:
            # Meilleure solution -> accepter
            current_route = new_route
            current_distance = new_distance
            
            if current_distance < best_distance:
                best_route = current_route.copy()
                best_distance = current_distance
                print(f"Nouvelle meilleure solution: {best_distance:.2f} km")
        else:
            # Solution moins bonne -> accepter avec probabilité
            probability = math.exp(-(new_distance - current_distance) / temperature)
            if random.random() < probability:
                current_route = new_route
                current_distance = new_distance
        
        temperature *= cooling_rate
        iterations += 1
    
    print(f"Fin recuit simulé - Meilleure distance: {best_distance:.2f} km")
    return best_route, best_distance

# Routes d'authentification
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if email in ADMINS and ADMINS[email] == password:
        session['admin_id'] = 1
        session['admin_email'] = email
        return jsonify({'message': 'Connexion réussie', 'admin': {'id': 1, 'email': email}}), 200
    
    return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if 'admin_id' in session:
        return jsonify({'authenticated': True, 'admin': {'id': session['admin_id'], 'email': session['admin_email']}}), 200
    return jsonify({'authenticated': False}), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Déconnexion réussie'}), 200

# Routes des données
@app.route('/api/clients', methods=['GET'])
def get_clients():
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return jsonify(CLIENTS), 200

@app.route('/api/camions', methods=['GET'])
def get_camions():
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return jsonify(CAMIONS), 200

# Routes des tournées
@app.route('/api/tournee/optimize/<int:camion_id>', methods=['POST'])
def optimize_tournee(camion_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Vérifier que le camion existe
        camion = next((c for c in CAMIONS if c['id_camion'] == camion_id), None)
        if not camion:
            return jsonify({'error': 'Camion non trouvé'}), 404
        
        # Créer la matrice des distances
        n = len(CLIENTS)
        distance_matrix = [[0 for _ in range(n)] for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = calculate_distance_gps(
                        CLIENTS[i]['latitude'], CLIENTS[i]['longitude'],
                        CLIENTS[j]['latitude'], CLIENTS[j]['longitude']
                    )
                    distance_matrix[i][j] = dist
        
        # Optimiser avec recuit simulé
        cities = list(range(n))
        best_route, best_distance = simulated_annealing_tsp(distance_matrix, cities)
        
        # Convertir en informations clients
        ordre_clients = []
        for i in best_route:
            ordre_clients.append({
                'id_client': CLIENTS[i]['id_client'],
                'nom': CLIENTS[i]['nom'],
                'adresse': CLIENTS[i]['adresse']
            })
        
        temps_estime = best_distance / 50  # Vitesse moyenne 50 km/h
        
        tournee = {
            'id_tournee': len(TOURNEES) + 1,
            'id_camion': camion_id,
            'camion': camion,
            'ordre_clients': ordre_clients,
            'distance_totale': round(best_distance, 2),
            'temps_estime': round(temps_estime, 2),
            'date_creation': datetime.now().isoformat()
        }
        
        TOURNEES.append(tournee)
        return jsonify(tournee), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tournee/<int:camion_id>', methods=['GET'])
def get_tournee(camion_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Récupérer la dernière tournée pour ce camion
    tournees_camion = [t for t in TOURNEES if t['id_camion'] == camion_id]
    if not tournees_camion:
        return jsonify({'error': 'Aucune tournée trouvée pour ce camion'}), 404
    
    # Retourner la plus récente
    derniere_tournee = tournees_camion[-1]
    return jsonify(derniere_tournee), 200

@app.route('/api/tournee/all', methods=['GET'])
def get_all_tournees():
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return jsonify(TOURNEES), 200

@app.route('/api', methods=['GET'])
def home():
    return jsonify({'message': 'API viaCargo - Optimisation des tournées avec Recuit Simulé'}), 200

if __name__ == '__main__':
    print("Démarrage de l'API viaCargo avec données de test")
    print("Clients disponibles:", len(CLIENTS))
    print("Camions disponibles:", len(CAMIONS))
    app.run(debug=True, port=5000)