from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from models import db
import os

# Import des routes
from routes.routes_bnb import solution_bp
from routes.colis_route import colis_bp
from routes.camions_route import camions_bp
from routes.geo_route import geo_bp

app = Flask(__name__, static_folder='../frontend/build')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialisation de la base de données
db.init_app(app)

# Création des tables
with app.app_context():
    db.create_all()

# Enregistrement des blueprints AVANT les routes catch-all
app.register_blueprint(colis_bp, url_prefix='/api/colis')
app.register_blueprint(camions_bp, url_prefix='/api/camions')
app.register_blueprint(solution_bp, url_prefix='/api')
app.register_blueprint(geo_bp, url_prefix='/api/geo')

# Route de test API
@app.route('/api')
def home():
    return jsonify({"message": "API de gestion de stock fonctionnelle"}), 200

# Routes pour le frontend (à la fin)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Ne pas intercepter les routes API
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
        
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)