import os

class Config:
    """Configuration de l'application"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-delivery-2024'
    
    # Configuration MySQL
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or ''
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE') or 'viaCargo'
    
    # Configuration des sessions
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False  # True en production
    PERMANENT_SESSION_LIFETIME = 1800  # 30 minutes
    
    @classmethod
    def get_db_config(cls):
        return {
            'host': cls.MYSQL_HOST,
            'user': cls.MYSQL_USER,
            'password': cls.MYSQL_PASSWORD,
            'database': cls.MYSQL_DATABASE,
            'charset': 'utf8mb4'
        }