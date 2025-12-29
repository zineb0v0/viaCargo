from flask import Blueprint, jsonify
from models.models import Client, Depot

geo_bp = Blueprint("geo", __name__)

@geo_bp.route("/points", methods=["GET"])
def get_all_points():
    """Livrable : Renvoie le dépôt et les clients géolocalisés"""
    depot = Depot.query.first()
    clients = Client.query.all()
    
    # On ne renvoie que ceux qui ont des coordonnées valides
    data = {
        "depot": depot.to_dict() if (depot and depot.latitude) else None,
        "clients": [c.to_dict() for c in clients if c.latitude is not None]
    }
    return jsonify(data), 200