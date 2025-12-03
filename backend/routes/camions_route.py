from flask import Blueprint, request, jsonify
from models import db
from models.models import Camion

camions_bp = Blueprint("camions", __name__)

# ------------------------------
# GET TOUS LES CAMIONS
# ------------------------------
@camions_bp.route("/", methods=["GET"])
def get_camions():
    camions = Camion.query.all()
    return jsonify([c.to_dict() for c in camions]), 200

# ------------------------------
# GET CAMION PAR ID
# ------------------------------
@camions_bp.route("/<int:id_camion>", methods=["GET"])
def get_camion_by_id(id_camion):
    camion = Camion.query.get(id_camion)
    if not camion:
        return jsonify({"error": "Camion non trouvé"}), 404
    return jsonify(camion.to_dict()), 200

# ------------------------------
# AJOUTER UN CAMION
# ------------------------------
@camions_bp.route("/", methods=["POST"])
def add_camion():
    try:
        data = request.get_json()

        # Champs obligatoires
        required_fields = ["marque", "capacite"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Champ manquant: {field}"}), 400

        # Validation de la capacité
        try:
            capacite = float(data["capacite"])
            if capacite <= 0:
                return jsonify({"error": "La capacité doit être supérieure à 0"}), 400
        except ValueError:
            return jsonify({"error": "La capacité doit être un nombre valide"}), 400

        # Création du camion
        camion = Camion(
            marque=data["marque"],
            capacite=capacite,
            status=data.get("status", "disponible")
        )

        db.session.add(camion)
        db.session.commit()

        return jsonify(camion.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------------
# UPDATE CAMION
# ------------------------------
@camions_bp.route("/<int:id_camion>", methods=["PUT"])
def update_camion(id_camion):
    try:
        camion = Camion.query.get(id_camion)
        if not camion:
            return jsonify({"error": "Camion non trouvé"}), 404

        data = request.get_json()

        # Mise à jour des champs
        if "marque" in data:
            camion.marque = data["marque"]
            
        if "capacite" in data:
            try:
                capacite = float(data["capacite"])
                if capacite <= 0:
                    return jsonify({"error": "La capacité doit être supérieure à 0"}), 400
                camion.capacite = capacite
            except ValueError:
                return jsonify({"error": "La capacité doit être un nombre valide"}), 400
                
        if "status" in data:
            # Validation du statut
            valid_statuses = ["disponible", "hors_service", "en_livraison"]
            if data["status"] not in valid_statuses:
                return jsonify({"error": f"Statut invalide. Valeurs acceptées: {', '.join(valid_statuses)}"}), 400
            camion.status = data["status"]

        db.session.commit()
        return jsonify(camion.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------------
# DELETE CAMION
# ------------------------------
@camions_bp.route("/<int:id_camion>", methods=["DELETE"])
def delete_camion(id_camion):
    try:
        camion = Camion.query.get(id_camion)
        if not camion:
            return jsonify({"error": "Camion non trouvé"}), 404

        db.session.delete(camion)
        db.session.commit()
        return jsonify({"message": "Camion supprimé avec succès"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------------
# GET CAMIONS PAR STATUT
# ------------------------------
@camions_bp.route("/status/<string:status>", methods=["GET"])
def get_camions_by_status(status):
    """
    Récupérer tous les camions avec un statut spécifique
    Exemple: /api/camions/status/disponible
    """
    valid_statuses = ["disponible", "hors_service", "en_livraison"]
    if status not in valid_statuses:
        return jsonify({"error": f"Statut invalide. Valeurs acceptées: {', '.join(valid_statuses)}"}), 400
    
    camions = Camion.query.filter_by(status=status).all()
    return jsonify([c.to_dict() for c in camions]), 200

# ------------------------------
# GET STATISTIQUES DES CAMIONS
# ------------------------------
@camions_bp.route("/stats", methods=["GET"])
def get_camions_stats():
    """
    Récupérer des statistiques sur la flotte de camions
    """
    try:
        total_camions = Camion.query.count()
        disponibles = Camion.query.filter_by(status="disponible").count()
        en_livraison = Camion.query.filter_by(status="en_livraison").count()
        hors_service = Camion.query.filter_by(status="hors_service").count()
        
        # Capacité totale de la flotte
        capacite_totale = db.session.query(db.func.sum(Camion.capacite)).scalar() or 0
        
        return jsonify({
            "total": total_camions,
            "disponibles": disponibles,
            "en_livraison": en_livraison,
            "hors_service": hors_service,
            "capacite_totale": float(capacite_totale)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500