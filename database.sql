-- Création de la base de données
CREATE DATABASE IF NOT EXISTS viaCargo;
USE viaCargo;

-- Table des administrateurs
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des clients
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des camions
CREATE TABLE camions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    immatriculation VARCHAR(20) UNIQUE NOT NULL,
    marque VARCHAR(50),
    modele VARCHAR(50),
    capacite_poids DECIMAL(10,2) NOT NULL,
    capacite_volume DECIMAL(10,2) NOT NULL,
    statut ENUM('disponible', 'en_mission', 'en_entretien', 'hors_service') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des colis
CREATE TABLE colis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_colis VARCHAR(20) UNIQUE NOT NULL,
    id_client INT NOT NULL,
    adresse_livraison TEXT NOT NULL,
    poids DECIMAL(10,2) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    statut ENUM('en_attente', 'affecte', 'en_livraison', 'livre', 'annule') DEFAULT 'en_attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_livraison_prevue DATE,
    id_camion INT NULL,
    FOREIGN KEY (id_client) REFERENCES clients(id),
    FOREIGN KEY (id_camion) REFERENCES camions(id)
);


-- Admins (mot de passe: admin123 pour les deux)
INSERT INTO admins (username, password, full_name, email) VALUES 
('sophie', 'sophie123', 'Administrateur Principal', 'sophie@gmail.com'),
('manager', '12345', 'Manager Livraison', 'manager@delivery.com');

-- Clients
INSERT INTO clients (nom, prenom, email, telephone, adresse) VALUES 
('Dupont', 'Marie', 'marie.dupont@email.com', '01 23 45 67 89', '12 Rue de la Paix, 75002 Paris'),
('Martin', 'Jean', 'jean.martin@email.com', '04 56 78 90 12', '45 Avenue des Champs, 69001 Lyon'),
('Bernard', 'Sophie', 'sophie.bernard@email.com', '05 67 89 01 23', '8 Boulevard Victor Hugo, 33000 Bordeaux'),
('Dubois', 'Pierre', 'pierre.dubois@email.com', '03 21 43 65 87', '23 Rue Nationale, 59000 Lille');

-- Camions
INSERT INTO camions (immatriculation, marque, modele, capacite_poids, capacite_volume, statut) VALUES 
('AB-123-CD', 'Renault', 'Master', 3500.00, 15.00, 'disponible'),
('EF-456-GH', 'Mercedes', 'Sprinter', 5000.00, 20.00, 'disponible'),
('IJ-789-KL', 'Ford', 'Transit', 2800.00, 12.00, 'en_mission');

-- Colis en attente
INSERT INTO colis (code_colis, id_client, adresse_livraison, poids, volume, statut, date_livraison_prevue) VALUES 
('COL-001', 1, '12 Rue de la Paix, 75002 Paris', 15.00, 0.5, 'en_attente', '2024-12-20'),
('COL-002', 2, '45 Avenue des Champs, 69001 Lyon', 25.00, 0.8, 'en_attente', '2024-12-21'),
('COL-003', 3, '8 Boulevard Victor Hugo, 33000 Bordeaux', 10.00, 0.3, 'en_attente', '2024-12-22'),
('COL-004', 4, '23 Rue Nationale, 59000 Lille', 30.00, 1.2, 'en_attente', '2024-12-23');