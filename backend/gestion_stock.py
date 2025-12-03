from flask import Flask, request, jsonify
from database import query

app = Flask(__name__)

@app.route("/api/colis", methods=["GET"])
def get_colis():
    rows = query("SELECT * FROM colis", fetch=True)
    return jsonify(rows), 200

@app.route("/api/colis", methods=["POST"])
def add_colis():
    data = request.get_json()
    sql = "INSERT INTO colis (id_client, destination, poids, statut) VALUES (%s, %s, %s, %s) RETURNING *"
    params = (data["id_client"], data["destination"], data["poids"], data.get("statut", "en_stock"))
    new_colis = query(sql, params, fetch=True)
    return jsonify(new_colis[0]), 201

if __name__ == "__main__":
    app.run(debug=True)
