from flask import Blueprint, request, jsonify
from models import db
from models.models import Tournee, Client, Camion, Depot, Colis, Assignment
from routes.auth_route import login_required 
from services.simulated_annealing import SimulatedAnnealing, calculate_distance_gps

tournee_bp = Blueprint("tournee", __name__)

@tournee_bp.route("/optimize/<int:camion_id>", methods=["POST"])
def optimize_tournee(camion_id):
    """Optimise la tournée pour un camion donné"""
    try:
        # Vérifier que le camion existe
        camion = Camion.query.get(camion_id)
        if not camion:
            return jsonify({"error": "Camion non trouvé"}), 404
        
        # Récupérer SEULEMENT les colis assignés à ce camion par B&B
        assignments = db.session.query(Colis).join(Assignment).filter(Assignment.id_camion == camion_id).all()
        
        if not assignments:
            return jsonify({"error": "Aucun colis assigné à ce camion. Lancez d'abord l'optimisation B&B."}), 400
        
        if len(assignments) < 2:
            return jsonify({"error": "Pas assez de colis assignés pour optimiser la tournée"}), 400
        
        # Vérifier que tous les colis ont des coordonnées
        for colis in assignments:
            if not colis.latitude or not colis.longitude:
                return jsonify({"error": f"Coordonnées manquantes pour le colis {colis.id_colis}"}), 400
        
        # Créer matrice des distances pour les colis assignés
        n = len(assignments)
        distance_matrix = [[0 for _ in range(n)] for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = calculate_distance_gps(
                        assignments[i].latitude, assignments[i].longitude,
                        assignments[j].latitude, assignments[j].longitude
                    )
                    distance_matrix[i][j] = dist
        
        # Optimiser avec recuit simulé
        sa = SimulatedAnnealing(distance_matrix)
        indices = list(range(n))
        best_route, best_distance = sa.solve(indices)
        
        # Convertir en IDs des colis assignés
        ordre_colis = [assignments[i].id_colis for i in best_route]
        temps_estime = best_distance / 50  # Vitesse moyenne 50 km/h
        
        # Sauvegarder en base
        depot = db.session.query(db.func.min(Depot.id_depot)).scalar() or 1
        tournee = Tournee(
            depot_id=depot,
            camion_id=camion_id,
            ordre_clients=ordre_colis,
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