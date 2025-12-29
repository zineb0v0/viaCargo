from flask import Flask, jsonify, send_from_directory, session
from flask_cors import CORS
from config import Config
from models import db
import os

# Import des routes
from routes.routes_bnb import solution_bp
from routes.colis_route import colis_bp
from routes.camions_route import camions_bp
from routes.auth_route import auth_bp
from routes.tournee_route import tournee_bp


app = Flask(__name__, static_folder='../frontend/build')

# Configuration de base
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = Config.SECRET_KEY

# Configuration des sessions
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',  # 'Lax' pour développement local
    SESSION_COOKIE_SECURE=False      # False pour HTTP local, True pour HTTPS en production
)

# CORS - IMPORTANT : Configuration complète
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Initialisation de la base de données
db.init_app(app)

# Admins définis dans le code
ADMINS = {
    'admin1@viacargo.com': 'adminpass123',
    'manager@viacargo.com': 'manager123',
    'supervisor@viacargo.com': 'super123'
}

# Création des tables
with app.app_context():
    db.create_all()
    
    # Créer des admins par défaut si la table est vide
    from models.models import Admin, Client, Camion, Depot
    if Admin.query.count() == 0:
        for email, password in ADMINS.items():
            admin = Admin(email=email, password=password)
            db.session.add(admin)
        db.session.commit()
        print("✅ Admins créés avec succès!")
        print("Emails disponibles:", list(ADMINS.keys()))
    
    # Créer un dépôt par défaut si la table est vide
    if Depot.query.count() == 0:
        depot_default = Depot(
            nom='Dépôt Principal',
            adresse='Casablanca, Maroc',
            latitude=33.5731,
            longitude=-7.5898
        )
        db.session.add(depot_default)
        db.session.commit()
    
    # Créer des clients de test si la table est vide
    if Client.query.count() == 0:
        clients_test = [
            Client(nom='Client', prenom='Casablanca', adresse='Casablanca Centre', latitude=33.5731, longitude=-7.5898),
            Client(nom='Client', prenom='Rabat', adresse='Rabat Agdal', latitude=34.0209, longitude=-6.8416),
            Client(nom='Client', prenom='Marrakech', adresse='Marrakech Gueliz', latitude=31.6295, longitude=-7.9811),
            Client(nom='Client', prenom='Tanger', adresse='Tanger Ville', latitude=35.7595, longitude=-5.8340),
            Client(nom='Client', prenom='Fès', adresse='Fès Médina', latitude=34.0181, longitude=-5.0078)
        ]
        for client in clients_test:
            db.session.add(client)
        db.session.commit()

# Enregistrement des blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(colis_bp, url_prefix='/api/colis')
app.register_blueprint(camions_bp, url_prefix='/api/camions')
app.register_blueprint(solution_bp, url_prefix='/api')
app.register_blueprint(tournee_bp, url_prefix='/api/tournee')


# Route de test API
@app.route('/api')
def home():
    return jsonify({"message": "API de gestion de stock fonctionnelle"}), 200

# Route de test pour vérifier la session
@app.route('/api/test-session')
def test_session():
    if 'admin_id' in session:
        return jsonify({
            "session_active": True,
            "admin_id": session.get('admin_id'),
            "admin_email": session.get('admin_email')
        })
    return jsonify({"session_active": False})

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