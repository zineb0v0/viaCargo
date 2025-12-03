from flask import Flask , jsonify , send_from_directory
from flask_cors import CORS
from config import Config
from models import db
import os

# Import des routes
from routes.colis_route import colis_bp

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

# Enregistrement des blueprints
app.register_blueprint(colis_bp, url_prefix='/api/colis')
app.register_blueprint(colis_bp, url_prefix='/api/camions')

# Route de test
@app.route('/')
def home():
    return jsonify({"message": "API de gestion de stock fonctionnelle"}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)