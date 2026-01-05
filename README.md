# ViaCargo – Plateforme de gestion logistique et optimisation des tournées

## 📦 Présentation du projet

ViaCargo est une application **full‑stack** de gestion logistique et d’optimisation des tournées de livraison. Elle permet aux administrateurs de gérer les dépôts, clients, colis, camions et d’optimiser les itinéraires de livraison à l’aide du méta‑heuristiques **Recuit Simulé (Simulated Annealing)**.

Le projet se compose de :

* **Backend** : Flask + PostgreSQL
* **Frontend** : Reactjs
* **Géocodage** : Conversion automatique des adresses en coordonnées GPS via Geopy (Nominatim)

---

---

## ⚙️ Prérequis

Assurez‑vous d’avoir installé :

* **Python 3.9+**
* **Node.js 18+** et npm
* **PostgreSQL** (avec pgAdmin 4)
* **Git**

---

## 🛠️ Installation du Backend (Flask)

### 1️⃣ Création et activation de l’environnement virtuel

⚠️ L’environnement virtuel utilisé dans ce projet s’appelle **envCargo**.

```bash
cd backend
python -m venv envCargo
# Windows
envCargo\Scripts\activate

```

### 2️⃣ Installation des dépendances

```bash
pip install -r requirements.txt
```

---

## 🗄️ Base de données 

### 1/ Création de la base

* Ouvrir **pgAdmin 4**
* Créer une base de données (`viaCargo`)

### 2/ Initialisation de la base

Dans le dossier `backend/`, un fichier **db.sql** est fourni.

👉 Il est **obligatoire** d’exécuter ce fichier comme **script SQL** dans pgAdmin 4 :

```
Click droit sur la base → Query Tool → Charger db.sql → Exécuter
```
### 3/ fichier config.py

Dans le dossier `backend/`, un fichier **config.py** est fourni.

*Il faut l’éditer et renseigner vos propres informations PostgreSQL ainsi que les paramètres requis.*
```
⚠️ Sans cette étape, l’application **ne fonctionnera pas**.
```

---

## 🔐 Comptes administrateurs

Le système initialise automatiquement des comptes administrateurs.

Vous pouvez vous connecter avec par exemple :

* **Email** : `admin1@viacargo.com`
* **Mot de passe** : `adminpass123`

---

## ▶️ Lancement du Backend

```bash
python app.py
```

L’API sera accessible à l’adresse :

```
http://localhost:5000/api
```

---

## 🌍 Géocodage (Étape CRITIQUE)

Le fichier **geocoder.py est obligatoire avant d’utiliser le recuit simulé**.

Pourquoi ?

* Le recuit simulé utilise une **matrice de distances**
* Cette matrice dépend des **coordonnées GPS**
* Sans géocodage → pas de distances → l’optimisation ne fonctionne pas

### Exécution du géocodage aprsé chaque modification ou ajout des colis

```bash
python geocoder.py
```

⚠️ Le script utilise **Nominatim (OpenStreetMap)**

* `time.sleep(1)` est volontaire pour éviter le blocage du service
* Une connexion Internet est requise

---

## 🎨 Installation du Frontend (React)

### 1️⃣ Installation des dépendances

```bash
cd frontend
npm install
```

### 2️⃣ Lancement du frontend

```bash
npm run dev
```

Le frontend sera disponible sur :

```
http://localhost:5173
```
Maintenez la touche `Ctrl` enfoncée puis cliquez sur le lien afin d’ouvrir la page du projet dans le navigateur.


---
---

## 🔗 Communication Frontend / Backend

* Frontend : **port 5173**
* Backend : **port 5000**
* CORS est déjà configuré dans `app.py`

⚠️ Les deux serveurs doivent être lancés simultanément.

---

## 🧠 Optimisation par Recuit Simulé

L’algorithme de recuit simulé est initialisé par **une descente locale** (Nearest Neighbor) :

```python
sa = SimulatedAnnealing(distance_matrix, use_nearest_neighbor=True)
```

👉 Pour utiliser une initialisation **aléatoire**, il suffit de supprimer le paramètre :

```python
sa = SimulatedAnnealing(distance_matrix)
```

---


## 🧪 Problèmes fréquents

* Erreur base de données → vérifier l’exécution de `db.sql`
* Erreur CORS → vérifier que le frontend tourne sur le bon port
* Carte vide / pas de routes → exécuter `geocoder.py`

---

✅ L’application ViaCargo est maintenant prête à être utilisée.
