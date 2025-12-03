-- À exécuter dans PostgreSQL
-- Crée la base (à exécuter une seule fois)
-- CREATE DATABASE viacargo;

-- Ensuite : \c viacargo  pour se connecter à la base

CREATE TABLE client (
    id_client  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom        VARCHAR(100) NOT NULL,
    prenom     VARCHAR(100) NOT NULL,
    adresse    VARCHAR(255) NOT NULL
);

CREATE TABLE admin (
    id_admin  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email     VARCHAR(255) UNIQUE NOT NULL,
    password  VARCHAR(255) NOT NULL
);

CREATE TABLE camion (
    id_camion  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    marque     VARCHAR(100) NOT NULL,
    capacite   FLOAT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'disponible',
    CHECK (status IN ('disponible', 'en_livraison', 'hors_service'))
);

CREATE TABLE colis (
    id_colis        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_client       INTEGER NOT NULL,
    destination     VARCHAR(255) NOT NULL,
    poids           FLOAT NOT NULL,
    statut          VARCHAR(20) NOT NULL DEFAULT 'en_stock',
    date_livraison  TIMESTAMP NULL,
    
    CHECK (statut IN ('en_stock', 'en_livraison', 'livre')),

    CONSTRAINT fk_colis_client
        FOREIGN KEY (id_client)
        REFERENCES client(id_client)
        ON DELETE CASCADE
);

CREATE TABLE assignments (
    id_assignment  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_camion      INTEGER NOT NULL,
    id_colis       INTEGER NOT NULL,
    time           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_assig_camion
        FOREIGN KEY (id_camion)
        REFERENCES camion(id_camion)
        ON DELETE CASCADE,

    CONSTRAINT fk_assig_colis
        FOREIGN KEY (id_colis)
        REFERENCES colis(id_colis)
        ON DELETE CASCADE
);
