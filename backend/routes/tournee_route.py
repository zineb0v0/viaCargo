from flask import Blueprint, request, jsonify
from models import db
from models.models import Tournee, Client, Camion , Depot
from routes.auth_route import login_required 
from services.simulated_annealing import SimulatedAnnealing, calculate_distance_gps

tournee_bp = Blueprint("tournee", __name__)

@tournee_bp.route("/optimize/<int:camion_id>", methods=["POST"])
@login_required
def optimize_tournee(camion_id):
    """Optimise la tournée uniquement pour les colis assignés par le sac à dos"""
    try:
        # 1. Vérifier que le camion existe
        camion = Camion.query.get(camion_id)
        if not camion:
            return jsonify({"error": "Camion non trouvé"}), 404

        # 2. FILTRE SAC À DOS : Récupérer uniquement les colis assignés à ce camion
        # On joint la table Assignment avec Colis pour obtenir les données géographiques
        from models.models import Assignment, Colis
        assignments = db.session.query(Colis).join(Assignment).filter(Assignment.id_camion == camion_id).all()
        
        if not assignments:
            return jsonify({"error": "Aucun colis assigné à ce camion par l'algorithme du sac à dos"}), 400
        
        # 3. Récupérer le dépôt pour le point de départ
        depot = Depot.query.first()
        if not depot:
            return jsonify({"error": "Dépôt non configuré"}), 404

        # 4. Construire la liste des points : Dépôt (index 0) + les destinations des colis
        points = []
        # Point 0 : Le Dépôt
        points.append({"id": 0, "lat": depot.latitude, "lon": depot.longitude, "is_depot": True})
        
        # Points suivants : Les colis assignés
        for colis in assignments:
            points.append({
                "id": colis.id_colis, 
                "lat": colis.latitude, 
                "lon": colis.longitude,
                "is_depot": False
            })

        n = len(points)
        if n < 2:
            return jsonify({"error": "Nombre insuffisant de points pour une tournée"}), 400

        # 5. Créer la matrice des distances (incluant le dépôt)
        distance_matrix = [[0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    distance_matrix[i][j] = calculate_distance_gps(
                        points[i]["lat"], points[i]["lon"],
                        points[j]["lat"], points[j]["lon"]
                    )

        # 6. Optimiser avec recuit simulé
        sa = SimulatedAnnealing(distance_matrix)
        indices = list(range(n))
        best_route_indices, best_distance = sa.solve(indices)

        # 7. Reformater l'ordre pour stocker uniquement les IDs des colis (en excluant le dépôt du JSON final si nécessaire)
        # ou garder l'ordre complet incluant le dépôt (0)
        ordre_final_ids = []
        for idx in best_route_indices:
            point = points[idx]
            if point["is_depot"]:
                ordre_final_ids.append("DEPOT")
            else:
                ordre_final_ids.append(point["id"])

        temps_estime = best_distance / 40  # Vitesse moyenne ajustée à 40 km/h

        # 8. Sauvegarder la tournée
        tournee = Tournee(
            depot_id=depot.id_depot,
            camion_id=camion_id,
            ordre_clients=ordre_final_ids,
            distance_totale=round(best_distance, 2),
            temps_estime=round(temps_estime, 2)
        )
        
        db.session.add(tournee)
        db.session.commit()
        
        return jsonify(tournee.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500