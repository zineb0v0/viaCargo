from flask import Blueprint, jsonify
from models.models import Colis, Depot

geo_bp = Blueprint("geo", __name__)

@geo_bp.route("/points", methods=["GET"])
def get_all_points():
    depot = Depot.query.first()
    colis_list = Colis.query.all()
    data = {
        "depot": depot.to_dict() if (depot and depot.latitude) else None,
        "colis": [c.to_dict() for c in colis_list if c.latitude is not None]
    }
    
    return jsonify(data), 200