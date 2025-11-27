import mysql.connector
from mysql.connector import Error
from config import Config

class Database:
    """Classe pour gérer la connexion à la base de données"""
    
    @staticmethod
    def get_connection():
        """Établit une connexion à la base de données"""
        try:
            connection = mysql.connector.connect(**Config.get_db_config())
            return connection
        except Error as e:
            print(f"❌ Erreur de connexion MySQL: {e}")
            return None
    
    @staticmethod
    def execute_query(query, params=None, fetch=False):
        """Exécute une requête SQL"""
        connection = Database.get_connection()
        if not connection:
            return None
        
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
            else:
                connection.commit()
                result = cursor.lastrowid
            
            return result
        except Error as e:
            print(f"❌ Erreur SQL: {e}")
            connection.rollback()
            return None
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def execute_single(query, params=None):
        """Exécute une requête et retourne un seul résultat"""
        connection = Database.get_connection()
        if not connection:
            return None
        
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            return cursor.fetchone()
        except Error as e:
            print(f"❌ Erreur SQL: {e}")
            return None
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()