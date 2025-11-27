from flask import Flask, render_template, request, redirect, url_for, session, flash
from functools import wraps
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
app.secret_key = 'delivery-secret-key-12345'

# Configuration MySQL
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'viaCargo',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Établit une connexion à la base de données"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Erreur de connexion à la base de données: {e}")
        return None

def verify_password(plain_password, stored_password):
    """Vérifie le mot de passe en clair"""
    return plain_password == stored_password

def get_admin_by_username(username):
    """Récupère un admin par son username"""
    connection = get_db_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE username = %s AND is_active = TRUE", (username,))
        admin = cursor.fetchone()
        return admin
    except Error as e:
        print(f"Erreur lors de la récupération de l'admin: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_pending_shipments():
    """Récupère les colis en attente"""
    connection = get_db_connection()
    if not connection:
        return []
    
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT c.*, cl.nom, cl.prenom 
        FROM colis c 
        JOIN clients cl ON c.id_client = cl.id 
        WHERE c.statut = 'en_attente'
        ORDER BY c.date_creation
        """
        cursor.execute(query)
        shipments = cursor.fetchall()
        return shipments
    except Error as e:
        print(f"Erreur lors de la récupération des colis: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def login_required(f):
    """Décorateur pour protéger les routes"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash('Veuillez vous connecter pour accéder à cette page', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def home():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('Veuillez remplir tous les champs', 'error')
            return render_template('login.html')
        
        # Vérification dans la base de données
        admin = get_admin_by_username(username)
        
        # Modification ici : plus de bcrypt, comparaison directe
        if admin and password == admin['password']:
            # Connexion réussie
            session['username'] = username
            session['name'] = admin['full_name']
            session['user_id'] = admin['id']
            
            flash(f'Connexion réussie ! Bienvenue {admin["full_name"]}', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Nom d\'utilisateur ou mot de passe incorrect', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    """Page principale avec les colis en attente"""
    shipments = get_pending_shipments()
    
    # Calcul des KPIs
    total_pending = len(shipments)
    total_weight = sum(shipment['poids'] for shipment in shipments)
    
    kpis = {
        'total_pending': total_pending,
        'total_weight': total_weight
    }
    
    # Formatage des colis pour le template
    formatted_shipments = []
    for shipment in shipments:
        formatted_shipments.append({
            'id': shipment['code_colis'],
            'client': f"{shipment['prenom']} {shipment['nom']}",
            'address': shipment['adresse_livraison'],
            'weight': shipment['poids']
        })
    
    return render_template('dashboard.html', 
                         kpis=kpis, 
                         shipments=formatted_shipments,
                         username=session.get('name'))

@app.route('/logout')
def logout():
    """Déconnexion de l'utilisateur"""
    session.clear()
    flash('Vous avez été déconnecté avec succès', 'success')
    return redirect(url_for('login'))

# Routes pour les autres sections du menu
@app.route('/gestion-stock')
@login_required
def gestion_stock():
    return render_template('gestion_stock.html', username=session.get('name'))

@app.route('/gestion-camions')
@login_required
def gestion_camions():
    return render_template('gestion_camions.html', username=session.get('name'))

@app.route('/chargement-camions')
@login_required
def chargement_camions():
    return render_template('chargement_camions.html', username=session.get('name'))

if __name__ == '__main__':
    app.run(debug=True)