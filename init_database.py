import mysql.connector
from mysql.connector import Error

def init_database():
    """Initialise la base de données avec les tables et données de test"""
    
    config = {
        'host': 'localhost',
        'user': 'root',
        'password': ''
    }
    
    try:
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        cursor.execute("CREATE DATABASE IF NOT EXISTS viaCargo")
        cursor.execute("USE viaCargo")
        
        with open('database.sql', 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        for statement in sql_script.split(';'):
            if statement.strip():
                cursor.execute(statement)
        
        connection.commit()
        print("✅ Base de données initialisée avec succès!")
        print("👤 Comptes créés (mots de passe en clair):")
        print("   - admin / admin123")
        print("   - manager / admin123")
        
    except Error as e:
        print(f"❌ Erreur: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    init_database()