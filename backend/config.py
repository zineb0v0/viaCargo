import os

class Config:
    DB_HOST = "localhost"
    DB_USER = "postgres"
    DB_PASSWORD = "soufia2004"
    DB_NAME = "viacargo"
    DB_PORT = 5432
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
