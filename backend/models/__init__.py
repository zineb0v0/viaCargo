from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .models import Admin, Camion, Colis, Assignment, Client, Depot