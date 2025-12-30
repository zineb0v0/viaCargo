import os

class Config:
    DB_HOST = "localhost"
    DB_USER = "postgres"
    DB_PASSWORD = "test123"
    DB_NAME = "viaCargo"
    DB_PORT = 5432
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
