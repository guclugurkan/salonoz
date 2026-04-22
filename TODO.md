# 📝 Plan d'action : Projet Salon OZ

Voici la liste des tâches à accomplir pour finaliser le projet et le rendre prêt pour une utilisation réelle en production.

## 🔴 Priorité Haute (Sécurité & Indispensables)
- [ ] **Sécurisation de l'Admin** : Ajouter une page de login pour accéder au Dashboard. Personne d'autre que l'administrateur ne doit voir les rendez-vous.
- [ ] **Protection de l'API** : Empêcher les appels directs à l'API `/api/appointments` sans jeton de sécurité (JWT).
- [ ] **Validation des Données** : S'assurer que le formulaire de réservation vérifie correctement le format des emails, des téléphones et empêche les doublons.

## 🟡 Priorité Moyenne (Fiabilité & Performance)
- [ ] **Base de Données réelle** : Remplacer le fichier `appointments.json` par une base de données robuste (PostgreSQL ou MongoDB) pour éviter toute perte de données.
- [ ] **Configuration Email Salon** : Configurer les accès SMTP définitifs pour que le salon et le client reçoivent des emails de confirmation professionnels.
- [ ] **Gestion des Images** : Optimiser les images de la galerie pour un chargement rapide (WebP) ou utiliser un service comme Cloudinary.
- [ ] **SEO & Meta-données** : Optimiser les titres et descriptions de chaque page pour que Google trouve facilement le salon.

## 🟢 Priorité Basse (Amélioration de l'Expérience)
- [ ] **Dashboard Amélioré** : Ajouter des statistiques simples (nombre de réservations par mois, services les plus demandés).
- [ ] **Notifications SMS** : (Optionnel) Envoyer un rappel par SMS la veille du rendez-vous.
- [ ] **Mode Sombre / Clair** : Harmoniser parfaitement le design selon les préférences utilisateur.
- [ ] **Avis Clients** : Permettre aux clients de laisser un avis directement sur le site après leur rendez-vous.

---
## 🚀 Prochaines étapes suggérées
1. **Étape 1** : Mise en place de l'authentification Admin (Login).
2. **Étape 2** : Migration vers une vraie base de données.
3. **Étape 3** : Finalisation du système de mail.






En mobile, mon about.jsx, la taille des textes à diminuer pcq ça prend trop de place. 
La gallery, faut afficher les images 2 par 2.
OK

coté admin j'dois pouvoir ajouter les images. 