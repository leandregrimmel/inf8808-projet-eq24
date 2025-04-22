# INF8808 - Visualisation des Tendances Musicales

Ce projet offre une plateforme interactive d'analyse et de visualisation des tendances musicales populaires sur Spotify et d'autres plateformes de streaming.

## Aperçu du Projet

Notre application web permet d'explorer les données des chansons les plus écoutées en 2024 à travers diverses visualisations interactives. L'interface utilise une approche "scrollytelling" pour guider l'utilisateur à travers différentes analyses thématiques.

## Fonctionnalités

- **Vue d'ensemble** : Statistiques générales sur le dataset (nombre de pistes, streams moyens, etc.)
- **Aspect Temporel** : Analyse de la relation entre l'âge des titres et leur popularité
- **Multi-plateformes** : Comparaisons de performances entre différentes plateformes de streaming
- **Contenu Explicite** : Analyse de l'impact du contenu explicite sur la popularité
- **Diffusion & Rayonnement** : Visualisation de la portée géographique des artistes
- **Engagement Utilisateur** : Analyse du comportement des utilisateurs sur différentes plateformes

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/inf8808-projet-eq24.git
cd inf8808-projet-eq24

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm start
```

## Technologies Utilisées

- **React** : Framework JavaScript pour l'interface utilisateur
- **D3.js** : Bibliothèque de visualisation de données
- **Tailwind CSS** : Framework CSS pour le design

## Structure du Projet

- `src/components` : Composants React pour les différentes visualisations
- `src/hooks` : Hooks personnalisés pour la gestion des données
- `src/context` : Contextes React pour le partage d'état
- `src/styles` : Fichiers CSS et configuration Tailwind
- `public` : Ressources statiques, incluant le dataset CSV

## Déploiement

L'application est accessible en ligne à l'adresse suivante : [https://votre-username.github.io/inf8808-projet-eq24](https://votre-username.github.io/inf8808-projet-eq24)

Pour déployer une nouvelle version :

```bash
npm run build
npm run deploy
```

## Équipe

Développé dans le cadre du cours INF8808 - Visualisation de données à Polytechnique Montréal.

## Source des Données

Les données proviennent du jeu de données "Most Streamed Spotify Songs 2024" et incluent des métriques de diverses plateformes comme Spotify, YouTube, et autres services de streaming musical.
