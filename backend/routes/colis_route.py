from flask import Blueprint, request, jsonify
from models import db
from models.models import Colis
from datetime import datetime

colis_bp = Blueprint("colis", __name__)

# ------------------------------
# GET TOUS LES COLIS
# ------------------------------
@colis_bp.route("/", methods=["GET"])
def get_colis():
    colis = Colis.query.all()
    return jsonify([c.to_dict() for c in colis]), 200

# ------------------------------
# GET COLIS PAR ID
# ------------------------------
@colis_bp.route("/<int:id_colis>", methods=["GET"])
def get_colis_by_id(id_colis):
    colis = Colis.query.get(id_colis)
    if not colis:
        return jsonify({"error": "Colis non trouvé"}), 404
    return jsonify(colis.to_dict()), 200

# ------------------------------
# AJOUTER UN COLIS
# ------------------------------
@colis_bp.route("/", methods=["POST"])
def add_colis():
    try:
        data = request.get_json()

        # Champs obligatoires
        required_fields = ["nom_client", "destination", "poids", "date_livraison"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Champ manquant: {field}"}), 400

        # Vérification de la date
        try:
            date_livraison = datetime.strptime(data["date_livraison"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Format date_livraison invalide. Format attendu: YYYY-MM-DD"}), 400

        # Création du colis
        colis = Colis(
            nom_client=data["nom_client"],
            destination=data["destination"],
            poids=data["poids"],
            statut=data.get("statut", "en_stock"),
            date_livraison=date_livraison
        )

        db.session.add(colis)
        db.session.commit()

        return jsonify(colis.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------------
# UPDATE COLIS
# ------------------------------
@colis_bp.route("/<int:id_colis>", methods=["PUT"])
def update_colis(id_colis):
    try:
        colis = Colis.query.get(id_colis)
        if not colis:
            return jsonify({"error": "Colis non trouvé"}), 404

        data = request.get_json()

        # ✅ AJOUT: Mise à jour du nom_client
        if "nom_client" in data:
            colis.nom_client = data["nom_client"]
            
        if "destination" in data:
            colis.destination = data["destination"]
        if "poids" in data:
            colis.poids = data["poids"]
        if "statut" in data:
            colis.statut = data["statut"]
        if "date_livraison" in data:
            colis.date_livraison = datetime.strptime(data["date_livraison"], "%Y-%m-%d")

        db.session.commit()
        return jsonify(colis.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------------
# DELETE COLIS
# ------------------------------
@colis_bp.route("/<int:id_colis>", methods=["DELETE"])
def delete_colis(id_colis):
    try:
        colis = Colis.query.get(id_colis)
        if not colis:
            return jsonify({"error": "Colis non trouvé"}), 404

        db.session.delete(colis)
        db.session.commit()
        return jsonify({"message": "Colis supprimé avec succès"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------------
# GET COLIS PAR CLIENT
# ------------------------------
"""@colis_bp.route("/client/<int:client_id>", methods=["GET"])
def get_colis_by_client(client_id):
    colis_list = Colis.query.filter_by(id_client=client_id).all()
    return jsonify([c.to_dict() for c in colis_list]), 200
"""