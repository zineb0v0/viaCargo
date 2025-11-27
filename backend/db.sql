CREATE DATABASE IF NOT EXISTS viaCargo;
USE viaCargo;

CREATE TABLE client (
    id_client      INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100) NOT NULL,
    adresse        VARCHAR(255) NOT NULL
);
CREATE TABLE admin (
    id_admin   INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL
);
CREATE TABLE camion (
    id_camion   INT AUTO_INCREMENT PRIMARY KEY,
    marque      VARCHAR(100) NOT NULL,
    capacite    FLOAT NOT NULL,
    status      ENUM('disponible', 'en_livraison', 'hors_service') DEFAULT 'disponible'
);

CREATE TABLE colis (
    id_colis        INT AUTO_INCREMENT PRIMARY KEY,
    id_client       INT NOT NULL,
    destination     VARCHAR(255) NOT NULL,
    poids           FLOAT NOT NULL,
    statut          ENUM('en_stock', 'en_livraison', 'livre') DEFAULT 'en_stock',
    date_livraison  DATETIME NULL,
    
    CONSTRAINT fk_colis_client
        FOREIGN KEY (id_client) REFERENCES client(id_client)
        ON DELETE CASCADE
);
CREATE TABLE assignments (
    id_assignment INT AUTO_INCREMENT PRIMARY KEY,
    id_camion     INT NOT NULL,
    id_colis      INT NOT NULL,
    time          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_assig_camion
        FOREIGN KEY (id_camion) REFERENCES camion(id_camion)
        ON DELETE CASCADE,

    CONSTRAINT fk_assig_colis
        FOREIGN KEY (id_colis) REFERENCES colis(id_colis)
        ON DELETE CASCADE
);
