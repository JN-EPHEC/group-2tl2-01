# Rapport de projet — Club Sportif

**Cours** : Programmation 3 — 2TL2  
**Groupe** : group-2tl2-01  
**Équipe** : Thomas Charlier / Sofiane Amqrane / Cyril Schweicher

---

## 1. Pitch de l'application

**Club Sportif** est une application web de gestion complète pour un club sportif. Elle permet à l'administration du club de gérer l'ensemble de ses activités au quotidien.

### Problème résolu

Un club sportif doit gérer de nombreuses informations : les familles inscrites, leurs membres, les cours planifiés, les présences, et un système de crédits permettant de payer les séances. Sans outil dédié, cette gestion se fait via des fichiers Excel éparpillés, sans historique ni traçabilité.

### Solution apportée

Une application web centralisée avec 3 niveaux d'accès :

 Rôle / Droits 
**Admin** : Accès complet — CRUD sur toutes les entités, exports, imports, journal 
 **Coach** : Lecture familles/membres, création et gestion des cours et présences 
 **Famille** : Accès à sa propre fiche famille et ses membres uniquement 

### Fonctionnalités principales

- **Gestion des familles** — inscription, coordonnées, solde de crédits
- **Gestion des membres** — profil, photo, poids, historique des présences
- **Gestion des cours** — planification, types de cours, gestion des présences
- **Système de crédits FIFO** — achat de crédits, déduction automatique à chaque présence
- **Import/Export Excel** — import de données depuis Excel, export complet en Excel
- **Journal d'activité** — traçabilité de toutes les actions importantes
- **Authentification sécurisée** — JWT avec refresh token automatique

---

## 2. Refactoring initial

### Code source choisi

Le code de départ choisi pour le refactoring est celui de **Thomas Charlier**. Il s'agissait d'une base Express + Sequelize avec une authentification JWT basique et quelques routes CRUD partiellement implémentées.

### Ce qui a été refactorisé

Le code initial présentait plusieurs problèmes :

- **Architecture plate** pas de séparation claire entre routes, controllers et services
- **Pas de gestion d'erreurs centralisée** chaque route gérait ses erreurs différemment
- **Mots de passe exposés** dans les réponses API
- **Pas de typage TypeScript** strict sur les modèles
- **Pas de migrations** les tables étaient créées via `sync()` uniquement

Le refactoring a introduit :
- Une **architecture en couches** claire (routes → controllers → services → models)
- Un **middleware errorHandler** centralisé
- Un **middleware jwtAuth** et **roleCheck** réutilisables
- Des **migrations Sequelize** pour gérer l'évolution du schéma
- Un **typage TypeScript** strict sur tous les modèles et interfaces

### Difficultés d'adaptation pour les autres membres

**Sofiane ** a eu des difficultés à s'adapter à :
- L'utilisation de **TypeScript strict** avec les interfaces Sequelize (`UserAttributes`, `UserCreationAttributes`)
- La séparation controller/service — l'idée était de mettre toute la logique dans le controller

**Cyril ** a eu des difficultés à s'adapter à :
- La configuration de **Sequelize CLI** et l'ordre d'exécution des migrations (dépendances entre tables)
- La syntaxe des **associations Sequelize** (`belongsTo`, `hasMany`, clés étrangères)

---

## 3. Infrastructure de déploiement

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/22cfaca8-3337-4d77-8ea7-8e9230689630" />


### Rôle de chaque composant

Composant / Rôle
**GitHub Actions** : Exécute les tests Jest à chaque push, puis déploie sur le VPS via SSH si les tests passent 
**Docker Compose** : Orchestre les 2 conteneurs (client + server) dans un réseau isolé 
**Nginx** : Sert les fichiers statiques React, redirige `/api/*` vers Express, sert Swagger 
**Express** : API REST — reçoit les requêtes, authentifie, délègue aux services 
**Supabase** : Base de données PostgreSQL hébergée dans le cloud 

### Flux d'une requête utilisateur

```
Navigateur → Port 80 (Nginx)
    ├── /           → fichiers statiques React (SPA)
    ├── /api/*      → proxy → Express:3001 → PostgreSQL
    └── /api-docs   → proxy → Express:3001 → Swagger UI
```

---

## 4. Design Patterns utilisés

### 4.1 MVC — Model View Controller

**Où** : Architecture complète du backend

**Comment** :
- **Model** → `server/src/models/` — définition des tables Sequelize (`User`, `Family`, `Member`...)
- **View** → `client/src/pages/` — composants React (la vue est côté frontend)
- **Controller** → `server/src/controllers/` — reçoit les requêtes HTTP, valide, délègue

**Pourquoi** : Sépare les responsabilités. Le controller ne connaît pas la base de données, le model ne connaît pas HTTP.

```
Route → Controller → Service → Model → PostgreSQL
```

---

### 4.2 Service Layer (Séparation des préoccupations)

**Où** : `server/src/services/`

**Comment** : Toute la logique métier est isolée dans des services indépendants des controllers :
- `userService.ts` — CRUD utilisateurs, hachage bcrypt
- `creditService.ts` — logique FIFO des crédits
- `familyService.ts` — gestion familles + solde crédits
- `activityLogService.ts` — journalisation silencieuse

**Pourquoi** : Le controller ne sait pas comment fonctionne le FIFO des crédits. Il appelle juste `creditService.consumeCredit()`. Cela rend le code testable unitairement.

---

### 4.3 Middleware Chain (Chaîne de responsabilité)

**Où** : `server/src/middlewares/`

**Comment** : Les requêtes passent par une chaîne de middlewares avant d'atteindre le controller :

```
Requête → jwtAuth → roleCheck → controller
```

- `jwtAuth.ts` : vérifie et décode le token JWT
- `roleCheck.ts` : vérifie les droits d'accès
- `errorHandler.ts` : capture toutes les erreurs non gérées

**Pourquoi** : Chaque middleware a une responsabilité unique. On peut ajouter ou retirer un middleware sans toucher au controller.

---

### 4.4 Repository Pattern (via Sequelize)

**Où** : `server/src/models/`

**Comment** : Sequelize abstrait complètement les requêtes SQL :
```ts
User.create(data)           // INSERT INTO users...
User.findOne({ where })     // SELECT * FROM users WHERE...
user.update(data)           // UPDATE users SET...
```

**Pourquoi** : Le code ne contient aucune requête SQL brute. Si on change de base de données (SQLite → PostgreSQL), seule la configuration change.

---

### 4.5 Context Pattern (React)

**Où** : `client/src/context/AuthContext.tsx`

**Comment** : L'état d'authentification (user, token) est partagé globalement via React Context :
```tsx
const { user, login, logout } = useAuth()
```

**Pourquoi** : Évite le "prop drilling" : n'importe quel composant peut accéder à l'utilisateur connecté sans passer les props à travers toute l'arborescence.

---

### 4.6 Interceptor Pattern (Axios)

**Où** : `client/src/api/client.ts`

**Comment** : Deux intercepteurs Axios :
- **Request** : ajoute automatiquement le token JWT à chaque requête
- **Response** : sur erreur 401, tente un refresh automatique du token, puis relance la requête

**Pourquoi** : Aucune page React ne gère manuellement le token ou le refresh. C'est transparent pour tout le reste du code.

---

### 4.7 FIFO — First In First Out

**Où** : `server/src/services/creditService.ts`

**Comment** : Lors d'une présence, le crédit le plus ancien est consommé en premier :
```ts
User.findOne({
  where: { remaining: { [Op.gt]: 0 } },
  order: [['purchaseDate', 'ASC']]  // le plus ancien d'abord
})
```

**Pourquoi** : Règle métier du club — les crédits achetés en premier doivent être utilisés en premier pour éviter qu'ils n'expirent.

---

## 5. Couverture de tests

Les tests unitaires couvrent les éléments critiques du backend :

Fichier testé / Ce qui est testé 
`creditService.test.ts` : Calcul du solde, logique FIFO, déduction et remboursement 
`middlewares.test.ts` : Validation JWT (valide/invalide/expiré), contrôle des rôles 
`activityLogService.test.ts` : Insertion de logs, gestion silencieuse des erreurs 

Pour générer le rapport de couverture :

```bash
cd server
npm run test:coverage
```

> **Test coverage** — 
<img width="1510" height="684" alt="image" src="https://github.com/user-attachments/assets/1a2f248e-1695-4585-b2cf-5837a229c568" />

---

