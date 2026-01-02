from flask import Blueprint, request, jsonify, session
from models.models import Admin
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email et mot de passe requis'}), 400
    
    admin = Admin.find_by_email(email)
    if admin and admin.check_password(password):
        session['admin_id'] = admin.id_admin
        session['admin_email'] = admin.email
        return jsonify({'message': 'Connexion réussie', 'admin': {'id': admin.id_admin, 'email': admin.email}}), 200
    
    return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Déconnexion réussie'}), 200

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if 'admin_id' in session:
        return jsonify({'authenticated': True, 'admin': {'id': session['admin_id'], 'email': session['admin_email']}}), 200
    return jsonify({'authenticated': False}), 200