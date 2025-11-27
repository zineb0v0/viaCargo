from flask import Blueprint, jsonify
from services.bnb_knapsack import executer_bnb

solution_bp = Blueprint("solution", __name__)

@solution_bp.route("/solution/sac_a_dos", methods=["GET"])
def lancer():
    sol = executer_bnb()
    return jsonify(sol)
