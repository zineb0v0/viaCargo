from flask import Blueprint, request, jsonify
from models import db
from models.models import Tournee, Client, Camion , Depot
from routes.auth_route import login_required 
from services.simulated_annealing import SimulatedAnnealing, calculate_distance_gps

tournee_bp = Blueprint("tournee", __name__)

@tournee_bp.route("/optimize/<int:camion_id>", methods=["POST"])
@login_required
def optimize_tournee(camion_id):
    """Optimise la tournée pour un camion donné"""
    try:
        # Vérifier que le camion existe
        camion = Camion.query.get(camion_id)
        if not camion:
            return jsonify({"error": "Camion non trouvé"}), 404
        
        # Récupérer les clients de la base de données
        clients = Client.query.all()
        
        if len(clients) < 2:
            return jsonify({"error": "Pas assez de clients pour optimiser"}), 400
        
        # Créer matrice des distances
        n = len(clients)
        distance_matrix = [[0 for _ in range(n)] for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = calculate_distance_gps(
                        clients[i].latitude, clients[i].longitude,
                        clients[j].latitude, clients[j].longitude
                    )
                    distance_matrix[i][j] = dist
        
        # Optimiser avec recuit simulé
        sa = SimulatedAnnealing(distance_matrix)
        cities = list(range(n))
        best_route, best_distance = sa.solve(cities)
        
        # Convertir en IDs clients
        ordre_clients = [clients[i].id_client for i in best_route]
        temps_estime = best_distance / 50  # Vitesse moyenne 50 km/h
        
        # Sauvegarder en base
        depot = db.session.query(db.func.min(Depot.id_depot)).scalar() or 1
        tournee = Tournee(
            depot_id=depot,
            camion_id=camion_id,
            ordre_clients=ordre_clients,
            distance_totale=round(best_distance, 2),
            temps_estime=round(temps_estime, 2)
        )
        
        db.session.add(tournee)
        db.session.commit()
        
        return jsonify(tournee.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@tournee_bp.route("/<int:camion_id>", methods=["GET"])
@login_required
def get_tournee(camion_id):
    """Récupère la dernière tournée optimisée pour un camion"""
    tournee = Tournee.query.filter_by(camion_id=camion_id).order_by(Tournee.id_tournee.desc()).first()
    
    if not tournee:
        return jsonify({"error": "Aucune tournée trouvée"}), 404
    
    return jsonify(tournee.to_dict()), 200

@tournee_bp.route("/all", methods=["GET"])
@login_required
def get_all_tournees():
    """Récupère toutes les tournées"""
    tournees = Tournee.query.all()
    return jsonify([t.to_dict() for t in tournees]), 200

@tournee_bp.route("/clients", methods=["GET"])
@login_required
def get_clients():
    """Récupère tous les clients"""
    clients = Client.query.all()
    return jsonify([c.to_dict() for c in clients]), 200