from . import db
from datetime import datetime


class Admin(db.Model):
    __tablename__ = "admin"
    id_admin = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            "id_admin": self.id_admin,
            "email": self.email,
        }

class Camion(db.Model):
    __tablename__ = "camion"
    id_camion = db.Column(db.Integer, primary_key=True)
    marque = db.Column(db.String(100), nullable=False)
    capacite = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="disponible")
    assignments = db.relationship("Assignment", backref="camion", cascade="all, delete")

    def to_dict(self):
        return {
            "id_camion": self.id_camion,
            "marque": self.marque,
            "capacite": self.capacite,
            "status": self.status,
        }

class Colis(db.Model):
    __tablename__ = "colis"
    nom_client = db.Column(db.String(100), nullable=False)
    id_colis = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(255), nullable=False)
    poids = db.Column(db.Float, nullable=False)
    statut = db.Column(db.String(20), nullable=False, default="en_stock")
    date_livraison = db.Column(db.DateTime, nullable=False)
    assignments = db.relationship("Assignment", backref="colis", cascade="all, delete")

    def to_dict(self):
        return {
            "id_colis": self.id_colis,
            "destination": self.destination,
            "poids": self.poids,
            "statut": self.statut,
            "date_livraison": self.date_livraison.isoformat() if self.date_livraison else None,
            "nom_client": self.nom_client,
        }

class Assignment(db.Model):
    __tablename__ = "assignments"
    id_assignment = db.Column(db.Integer, primary_key=True)
    id_camion = db.Column(db.Integer, db.ForeignKey("camion.id_camion"), nullable=False)
    id_colis = db.Column(db.Integer, db.ForeignKey("colis.id_colis"), nullable=False)
    time = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id_assignment": self.id_assignment,
            "camion": self.camion.to_dict(),
            "colis": self.colis.to_dict(),
            "time": self.time.isoformat(),
        }

class Client(db.Model):
    __tablename__ = "client"

    id_client = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    adresse = db.Column(db.String(255), nullable=False)

    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    def to_dict(self):
        return {
            "id_client": self.id_client,
            "nom": self.nom,
            "prenom": self.prenom,
            "adresse": self.adresse,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }

class Depot(db.Model):
    __tablename__ = "depot"

    id_depot = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(255), nullable=False)
    adresse = db.Column(db.String(255), nullable=False)

    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    tournees = db.relationship("Tournee", backref="depot", cascade="all, delete")

    def to_dict(self):
        return {
            "id_depot": self.id_depot,
            "nom": self.nom,
            "adresse": self.adresse,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }

class Tournee(db.Model):
    __tablename__ = "tournee"

    id_tournee = db.Column(db.Integer, primary_key=True)

    depot_id = db.Column(
        db.Integer,
        db.ForeignKey("depot.id_depot"),
        nullable=False
    )

    camion_id = db.Column(
        db.Integer,
        db.ForeignKey("camion.id_camion"),
        nullable=False
    )

    ordre_clients = db.Column(db.JSON, nullable=False)
    distance_totale = db.Column(db.Float)
    temps_estime = db.Column(db.Float)

    camion = db.relationship("Camion")

    def to_dict(self):
        return {
            "id_tournee": self.id_tournee,
            "depot_id": self.depot_id,
            "camion_id": self.camion_id,
            "ordre_clients": self.ordre_clients,
            "distance_totale": self.distance_totale,
            "temps_estime": self.temps_estime,
        }
