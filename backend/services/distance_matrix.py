import requests
from models import db, Camion, Colis, Assignment, DistanceMatrix, Depot
from datetime import datetime

# URL publique OSRM pour les distances
OSRM_URL = "http://router.project-osrm.org/table/v1/driving/"

def get_coordinates(depot, colis_list):
    """
    Retourne les coordonnées sous format 'lon,lat;lon,lat;...' pour OSRM.
    Le dépôt est ajouté en premier.
    """
    coords = [f"{depot.longitude},{depot.latitude}"]  # dépôt en premier
    for c in colis_list:
        lat, lon = map(float, c.destination.split(","))  # adapte si tu stockes lat/lon séparément
        coords.append(f"{lon},{lat}")
    return ";".join(coords)

def compute_distance_matrix(camion_id):
    """Calcule et stocke la matrice des distances pour un camion avec dépôt inclus."""
    # Récupérer le dépôt (on suppose un seul dépôt)
    depot = Depot.query.first()
    if not depot:
        print("Erreur : aucun dépôt trouvé.")
        return

    # Récupérer les colis assignés au camion
    assignments = Assignment.query.filter_by(id_camion=camion_id).all()
    colis_list = [a.colis for a in assignments]

    if len(colis_list) == 0:
        print(f"Aucun colis assigné pour le camion {camion_id}.")
        return

    # Construire la chaîne de coordonnées pour OSRM
    coords = get_coordinates(depot, colis_list)
    url = OSRM_URL + coords + "?annotations=distance"

    response = requests.get(url)
    if response.status_code != 200:
        print("Erreur OSRM :", response.text)
        return

    data = response.json()
    distances = data["distances"]  # distances[i][j]

    # Supprimer les anciennes distances pour ce camion
    DistanceMatrix.query.filter_by(id_camion=camion_id).delete()

    # Stocker dans la base
    points = [0] + [c.id_colis for c in colis_list]  # 0 = dépôt, puis les colis
    for i, from_id in enumerate(points):
        for j, to_id in enumerate(points):
            dm = DistanceMatrix(
                id_camion=camion_id,
                id_from=from_id,
                id_to=to_id,
                distance=distances[i][j]
            )
            db.session.add(dm)
    db.session.commit()
    print(f"Matrice des distances pour camion {camion_id} enregistrée.")

def compute_all_matrices():
    """Calcule les matrices pour tous les camions ayant des assignments."""
    camions = Camion.query.all()
    for camion in camions:
        compute_distance_matrix(camion.id_camion)

def get_matrix(camion_id):
    """
    Récupère la matrice de distances d'un camion.
    Renvoie un dict {id_from: {id_to: distance}}
    """
    dm = DistanceMatrix.query.filter_by(id_camion=camion_id).all()
    matrix = {}
    for row in dm:
        if row.id_from not in matrix:
            matrix[row.id_from] = {}
        matrix[row.id_from][row.id_to] = row.distance
    return matrix

if __name__ == "__main__":
    # Exemple de lancement
    with db.app.app_context():
        compute_all_matrices()
