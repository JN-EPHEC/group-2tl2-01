# Club Sportif — group-2tl2-01

Application web de gestion d'un club sportif développée dans le cadre du cours de Programmation III.

> **Application en production** : [http://91.134.138.161](http://91.134.138.161)  
> **Documentation API (Swagger)** : [http://91.134.138.161/api-docs](http://91.134.138.161/api-docs)

---

## Équipe

- **Thomas Charlier** : Architecture back-end, routes API, modèles, tests
- **Sofiane Amqrane** : Serveur Express, modèles Sequelize, services, composants UI
- **Cyril Schweicher** : Infrastructure Docker, migrations SQL, controllers, services

---

## Description

Application full-stack permettant à un club sportif de gérer :

- **Familles et membres** — inscription, profils, photos
- **Cours et présences** — planification, gestion des présences
- **Crédits** — système FIFO d'achat et de consommation de crédits
- **Utilisateurs** — 3 rôles : admin, coach, famille
- **Exports Excel** — familles, membres, présences, crédits, journal
- **Imports Excel** — import de familles et membres
- **Journal d'activité** — traçabilité de toutes les actions

---

## Stack technique

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — styles utilitaires
- **React Router** — navigation SPA
- **TanStack Query** — gestion du cache et des requêtes
- **Axios** — appels HTTP avec intercepteur JWT
- **React Hook Form** — gestion des formulaires

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Sequelize** — ORM
- **SQLite** (développement) / **PostgreSQL via Supabase** (production)
- **JWT** — authentification (access token 5min + refresh token 30j)
- **bcrypt** — hachage des mots de passe
- **ExcelJS** — génération de fichiers Excel
- **multer** — upload de fichiers
- **Swagger** — documentation API

### Infrastructure
- **Docker** + **Docker Compose** — conteneurisation
- **Nginx** — reverse proxy + serveur frontend
- **GitHub Actions** — CI/CD (tests + déploiement automatique)
- **VPS Linux** — hébergement

---

## Lancer le projet en développement

### Prérequis
- Node.js 20+
- npm

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/JN-EPHEC/group-2tl2-01.git
cd group-2tl2-01

# Installer les dépendances (racine + server + client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Configuration

```bash
# Copier le fichier d'exemple
cp server/.env.example server/.env
```

Remplir `server/.env` :

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=votre_secret_jwt
REFRESH_SECRET=votre_secret_refresh
DATABASE_URL=        # laisser vide pour SQLite local
CLIENT_URL=http://localhost:5173
```

### Lancer l'application

```bash
# Depuis la racine — lance le serveur et le client simultanément
npm start
```

- Frontend : [http://localhost:5173](http://localhost:5173)
- Backend : [http://localhost:3001](http://localhost:3001)
- Swagger : [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

### Migrations et seed

```bash
cd server

# Créer les tables
npm run migrate

# Créer l'utilisateur admin initial
npm run seed
```

**Identifiants admin par défaut :**
- Email : `admin@club.be`
- Mot de passe : `Admin1234!`

### Tests

```bash
cd server

# Lancer les tests
npm test

# Avec rapport de couverture
npm run test:coverage
```

---

## Lancer en production (Docker)

### Prérequis
- Docker + Docker Compose
- Un fichier `.env` à la racine

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=votre_secret_jwt
REFRESH_SECRET=votre_secret_refresh
CLIENT_URL=http://votre-ip
```

### Démarrage

```bash
docker compose up -d --build
```

L'application sera accessible sur le **port 80**.

---

## Structure du projet

```
group-2tl2-01/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── api/             # Appels HTTP (Axios)
│   │   ├── components/      # Composants réutilisables
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Pages React
│   │   └── types.ts         # Interfaces TypeScript
│   ├── Dockerfile
│   └── nginx.conf
├── server/                  # Backend Express
│   ├── src/
│   │   ├── controllers/     # Contrôleurs (logique HTTP)
│   │   ├── middlewares/     # JWT, roleCheck, errorHandler
│   │   ├── migrations/      # Migrations Sequelize
│   │   ├── models/          # Modèles Sequelize
│   │   ├── routes/          # Définition des routes
│   │   ├── seeders/         # Données initiales
│   │   ├── services/        # Logique métier
│   │   └── __tests__/       # Tests unitaires Jest
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/       # CI/CD GitHub Actions
├── README.md
└── REPORT.md
```
