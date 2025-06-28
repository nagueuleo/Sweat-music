# 🎵 Sweat Music - Application de Streaming Musical

Une application de streaming musical moderne inspirée de Spotify, développée avec Angular et Node.js. Cette application permet aux utilisateurs d'écouter de la musique, créer des playlists, et profiter d'une expérience musicale complète.

## ✨ Fonctionnalités

### 🎧 Pour tous les utilisateurs (sans connexion)

- **Écoute de musiques publiques** : 18 chansons populaires disponibles gratuitement
- **Interface moderne** : Design responsive avec thème sombre/clair
- **Contrôles de lecture** : Play, pause, suivant, précédent, volume
- **Recherche** : Recherche dans la bibliothèque publique
- **Mode hors-ligne** : Support PWA pour écouter sans connexion

### 🔐 Pour les utilisateurs connectés

- **Compte utilisateur** : Inscription et connexion sécurisées
- **Bibliothèque personnelle** : Musiques, albums et playlists
- **Playlists personnalisées** : Créer et gérer ses playlists
- **Historique d'écoute** : Suivi des musiques écoutées
- **Système de likes** : Marquer ses musiques préférées
- **Recommandations** : Suggestions personnalisées

### 👨‍💼 Pour les administrateurs

- **Dashboard admin** : Gestion des utilisateurs et contenus
- **Upload de musiques** : Ajouter de nouveaux contenus
- **Gestion des albums** : Créer et modifier des albums
- **Statistiques** : Suivi des écoutes et interactions

## 🛠️ Technologies Utilisées

### Frontend

- **Angular 20** : Framework principal
- **TypeScript** : Langage de programmation
- **Tailwind CSS** : Framework CSS
- **Howler.js** : Gestion audio
- **Angular PWA** : Support hors-ligne

### Backend

- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification
- **Multer** : Upload de fichiers
- **bcrypt** : Hashage des mots de passe

### Architecture

- **Microservices** : Architecture modulaire
- **API REST** : Communication client-serveur
- **Docker** : Conteneurisation
- **MongoDB Atlas** : Base de données cloud

## 📁 Structure du Projet

```
project/
├── frontend/                 # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services, guards, interceptors
│   │   │   ├── features/    # Composants principaux
│   │   │   └── shared/      # Composants partagés
│   │   └── public/          # Fichiers statiques (musiques, images)
│   └── package.json
├── backend/                  # Services backend
│   ├── server/              # Service principal
│   ├── music-service/       # Service musique
│   ├── user-service/        # Service utilisateur
│   ├── playlist-service/    # Service playlist
│   └── gateway/             # API Gateway
└── README.md
```

## 🚀 Installation et Déploiement

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **MongoDB** (local ou MongoDB Atlas)
- **Git**

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd spotifykl/project
```

### 2. Configuration de la base de données

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster gratuit
3. Obtenir l'URI de connexion
4. Créer un fichier `.env` dans `backend/server/` :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sweat-music
JWT_SECRET=votre_secret_jwt_super_securise
PORT=3000
```

### 3. Installation des dépendances

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend/server
npm install

cd ../music-service
npm install

cd ../user-service
npm install

cd ../playlist-service
npm install

cd ../gateway
npm install
```

### 4. Configuration des services

#### Service Principal (Server)

```bash
cd backend/server
npm run seed:seed  # Peupler la base de données
npm start          # Démarrer le serveur
```

#### Services Microservices

```bash
# Dans des terminaux séparés
cd backend/music-service && npm start
cd backend/user-service && npm start
cd backend/playlist-service && npm start
cd backend/gateway && npm start
```

### 5. Lancement de l'application

#### Mode Développement

```bash
cd frontend
npm start
```

L'application sera accessible sur `http://localhost:4200`

#### Mode Production

```bash
cd frontend
npm run build
npx http-server dist/spotify-clone-fullstack
```

### 6. Déploiement avec Docker

#### Build des images

```bash
# Backend
cd backend
docker-compose up --build

# Frontend
Installer d'abord les module avec npm i
cd frontend
docker-compose up --build ou ng s
```

## 🎮 Utilisation

### Première utilisation

1. **Accéder à l'application** : Ouvrir `http://localhost:4200`
2. **Explorer la bibliothèque publique** : Écouter les 18 musiques disponibles
3. **Créer un compte** : Cliquer sur "Créer un compte" pour plus de fonctionnalités

### Comptes de démonstration

- **Admin** : `admin@spotify-clone.com` / `admin123`
- **Utilisateur** : `john@example.com` / `password123`

### Fonctionnalités principales

- **Écoute** : Cliquer sur une musique pour la jouer
- **Playlist** : Créer des playlists personnalisées
- **Recherche** : Utiliser la barre de recherche
- **Bibliothèque** : Accéder à ses musiques et playlists
- **Profil** : Gérer son compte et préférences

## 🔧 Configuration Avancée

### Variables d'environnement

```env
# Base de données
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=votre_secret
JWT_EXPIRES_IN=7d

# Serveur
PORT=3000
NODE_ENV=development

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Configuration PWA

Le projet inclut le support PWA pour une expérience hors-ligne :

- Service Worker configuré
- Cache des musiques publiques
- Installation sur mobile

## 🐛 Dépannage

### Problèmes courants

#### L'application ne démarre pas

```bash
# Vérifier les ports
netstat -ano | findstr :4200
netstat -ano | findstr :3000

# Redémarrer les services
npm run build
npm start
```

#### Erreur de base de données

```bash
# Vérifier la connexion MongoDB
mongo "mongodb+srv://cluster.mongodb.net/sweat-music"

# Vérifier les variables d'environnement
echo $MONGODB_URI
```

#### Musiques qui ne se jouent pas

```bash
# Vérifier les fichiers audio
ls frontend/public/songs/

# Vérifier les permissions
chmod 644 frontend/public/songs/*.mp3
```

### Logs et débogage

```bash
# Logs du frontend
ng serve --verbose

# Logs du backend
DEBUG=* npm start

# Logs Docker
docker-compose logs -f
```

## 📊 Statistiques du Projet

- **18 musiques publiques** disponibles
- **6 albums** avec images de couverture
- **Architecture microservices** modulaire
- **Support PWA** pour mode hors-ligne
- **Interface responsive** mobile/desktop
- **Authentification JWT** sécurisée

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Développé par** : [Votre Nom]
**Date** : 2024
**Version** : 1.0.0

## 🙏 Remerciements

- **Spotify** pour l'inspiration
- **Angular Team** pour le framework
- **MongoDB** pour la base de données
- **Communauté open source** pour les bibliothèques

---

**🎵 Profitez de votre expérience musicale avec Sweat Music ! 🎵**
