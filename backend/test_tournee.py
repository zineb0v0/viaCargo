from flask import Flask, request, jsonify, session
from flask_cors import CORS
import math
import random

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'dev-secret-key'

# Données en mémoire
ADMINS = {
    'admin@viacargo.com': 'admin123',
    'manager@viacargo.com': 'manager123'
}

CLIENTS = [
    {'id_client': 1, 'nom': 'Client A', 'latitude': 33.5731, 'longitude': -7.5898},  # Casablanca
    {'id_client': 2, 'nom': 'Client B', 'latitude': 34.0209, 'longitude': -6.8416},  # Rabat
    {'id_client': 3, 'nom': 'Client C', 'latitude': 31.6295, 'longitude': -7.9811},  # Marrakech
    {'id_client': 4, 'nom': 'Client D', 'latitude': 35.7595, 'longitude': -5.8340}   # Tanger
]

TOURNEES = []

def calculate_distance_gps(lat1, lon1, lat2, lon2):
    R = 6371
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def simulated_annealing(distance_matrix, cities):
    current_route = cities.copy()
    random.shuffle(current_route)
    
    def calculate_distance(route):
        total = 0
        for i in range(len(route)):
            from_city = route[i]
            to_city = route[(i + 1) % len(route)]
            total += distance_matrix[from_city][to_city]
        return total
    
    current_distance = calculate_distance(current_route)
    best_route = current_route.copy()
    best_distance = current_distance
    
    temperature = 1000
    cooling_rate = 0.95
    
    while temperature > 1:
        new_route = current_route.copy()
        i, j = random.sample(range(len(current_route)), 2)
        new_route[i], new_route[j] = new_route[j], new_route[i]
        
        new_distance = calculate_distance(new_route)
        
        if new_distance < current_distance or random.random() < math.exp(-(new_distance - current_distance) / temperature):
            current_route = new_route
            current_distance = new_distance
            
            if current_distance < best_distance:
                best_route = current_route.copy()
                best_distance = current_distance
        
        temperature *= cooling_rate
    
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

# Routes des tournées
@app.route('/api/tournee/optimize/<int:camion_id>', methods=['POST'])
def optimize_tournee(camion_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Créer matrice des distances
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
    best_route, best_distance = simulated_annealing(distance_matrix, cities)
    
    # Convertir en IDs clients
    ordre_clients = [CLIENTS[i]['id_client'] for i in best_route]
    temps_estime = best_distance / 50  # 50 km/h
    
    tournee = {
        'id_tournee': len(TOURNEES) + 1,
        'id_camion': camion_id,
        'ordre_clients': ordre_clients,
        'distance_totale': round(best_distance, 2),
        'temps_estime': round(temps_estime, 2)
    }
    
    TOURNEES.append(tournee)
    return jsonify(tournee), 201

@app.route('/api/tournee/<int:camion_id>', methods=['GET'])
def get_tournee(camion_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    tournee = next((t for t in TOURNEES if t['id_camion'] == camion_id), None)
    if not tournee:
        return jsonify({'error': 'Aucune tournée trouvée'}), 404
    
    return jsonify(tournee), 200

@app.route('/api/clients', methods=['GET'])
def get_clients():
    if 'admin_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return jsonify(CLIENTS), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)