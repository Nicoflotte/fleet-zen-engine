# Fleet AI Companion

📙 Blueprint Produit UX/UI

FleetManager AI

Version 1.1

Date :

31/07/2026

Auteur métier :

Nicolas – Gestionnaire de flotte

Conception fonctionnelle :

Co-construite avec ChatGPT (OpenAI)

Statut :

Document de référence officiel pour la conception produit et UX/UI.

________________________________________

1. Vision produit

FleetManager AI est une plateforme intelligente de gestion de flotte permettant de gérer l'intégralité du cycle de vie des véhicules, des conducteurs, des coûts et des documents.

L'objectif est de proposer une solution moderne, simple d'utilisation et fortement automatisée grâce à l'intelligence artificielle, tout en conservant une validation humaine sur les décisions importantes.

FleetManager AI doit devenir un véritable assistant métier pour les gestionnaires de flotte, les directions financières, les agences et les conducteurs.

________________________________________

2. Les grands principes produit

Une seule saisie pour une information

Une donnée métier ne doit exister qu'une seule fois dans le système.

Exemple :

Un véhicule créé dans le parc doit être réutilisé dans :

•   affectations ;

•   maintenance ;

•   documents ;

•   coûts ;

•   KPI.

________________________________________

Aucun workflow bloquant

Le logiciel doit accompagner l'utilisateur sans empêcher l'activité.

Une anomalie génère :

•   une alerte ;

•   une proposition ;

•   une demande de validation.

Mais jamais un blocage inutile.

________________________________________

L'IA propose, l'utilisateur valide

L'intelligence artificielle :

•   analyse ;

•   détecte ;

•   propose ;

•   explique.

L'utilisateur :

•   contrôle ;

•   corrige ;

•   valide.

________________________________________

Processus paramétrables

Les règles métier doivent pouvoir évoluer sans modification importante du logiciel.

________________________________________

Historisation complète

Toute action importante doit être tracée :

•   utilisateur ;

•   date ;

•   modification ;

•   ancienne valeur ;

•   nouvelle valeur.

________________________________________

Propriété des données

Les données restent la propriété du client.

________________________________________

Simplicité utilisateur

Le logiciel doit rester simple malgré une richesse fonctionnelle importante.

________________________________________

3. Architecture fonctionnelle globale

FleetManager AI est organisé autour de plusieurs grands domaines :

Gestion flotte

•   véhicules ;

•   conducteurs ;

•   affectations ;

•   commandes ;

•   renouvellements ;

•   restitutions ;

•   ventes.

Gestion financière

•   carburant ;

•   péages ;

•   maintenance ;

•   pneumatiques ;

•   assurances ;

•   locations ;

•   sinistres.

Gestion documentaire

•   GED ;

•   classement ;

•   validation ;

•   recherche intelligente.

Intelligence artificielle

•   assistant métier ;

•   analyse documentaire ;

•   détection anomalies ;

•   prévisions.

Pilotage

•   KPI ;

•   reporting ;

•   exports.

________________________________________

4. Contenu du Blueprint

Partie 1 — Fondations

•   Vision produit

•   Architecture fonctionnelle

•   Rôles utilisateurs

•   Philosophie IA

________________________________________

Partie 2 — Gestion de la flotte

•   Parc véhicules

•   Conducteurs

•   Affectations

•   Renouvellements

•   Restitutions

•   Vente

•   Archivage

________________________________________

Partie 3 — Gestion des coûts

•   Carburant

•   Péage

•   Maintenance

•   Pneumatiques

•   Contraventions

•   Sinistres

•   Assurances

•   Locations

________________________________________

Partie 4 — GED intelligente

•   Classement automatique

•   Validation documentaire

•   OCR

•   Recherche IA

•   Historique

•   Coffre-fort documentaire

________________________________________

Partie 5 — Intelligence Artificielle

•   Assistant conversationnel

•   Analyse documentaire

•   Détection anomalies

•   Prévisions budgétaires

•   Centre de pilotage IA

•   Centre d'apprentissage IA

________________________________________

Partie 6 — KPI & Reporting

•   Tableaux de bord

•   KPI Direction

•   KPI DAF

•   Comparatifs

•   Exports Excel

•   Exports PDF

•   Exports PowerPoint

________________________________________

Partie 7 — Administration

•   Agences

•   Assureurs

•   Loueurs

•   Fournisseurs

•   Catégories véhicules

•   Paramétrage IA

•   Moteur de règles

________________________________________

Partie 8 — Connecteurs

•   Nibelis

•   Outlook

•   DKV

•   ULYS

•   Géolocalisation

•   Comptabilité

•   API externes

________________________________________

Partie 9 — Sécurité

•   Authentification

•   Entra ID

•   Gestion des droits

•   RGPD

•   Traçabilité

•   Sauvegardes

________________________________________

Partie 10 — Architecture cible

•   SaaS Multi-tenant

•   Performance

•   API

•   Observabilité

•   Scalabilité

•   Disponibilité

________________________________________

5. Rôles utilisateurs

Gestionnaire flotte

Rôle :

Administrateur métier.

Accès :

•   gestion complète flotte ;

•   véhicules ;

•   conducteurs ;

•   documents ;

•   coûts.

________________________________________

DAF

Rôle :

Pilotage financier.

Accès :

•   KPI ;

•   coûts ;

•   analyses ;

•   reporting.

________________________________________

Administrative agence

Rôle :

Gestion locale assistée.

Accès :

•   véhicules agence ;

•   conducteurs agence ;

•   documents autorisés.

________________________________________

Conducteur

Rôle :

Utilisateur portail personnel.

Accès :

•   véhicule attribué ;

•   documents personnels ;

•   actions autorisées.

________________________________________

6. Philosophie IA

L'IA FleetManager AI fonctionne comme un assistant métier.

Elle peut :

•   lire des documents ;

•   classer automatiquement ;

•   détecter des anomalies ;

•   rechercher une information ;

•   expliquer une situation ;

•   proposer une action.

Elle ne remplace jamais la décision humaine.

________________________________________

7. Design System UX/UI

Avant chaque développement d'écran, les éléments suivants doivent être définis :

Structure générale

•   navigation ;

•   menus ;

•   zones principales ;

•   hiérarchie visuelle.

Composants

•   cartes KPI ;

•   tableaux ;

•   filtres ;

•   formulaires ;

•   boutons ;

•   fenêtres modales ;

•   notifications.

États d'affichage

Chaque écran doit gérer :

•   données présentes ;

•   absence de données ;

•   erreur ;

•   chargement ;

•   droits insuffisants.

________________________________________

8. Écrans du produit

Chaque écran devra être décrit avec :

•   objectif ;

•   ergonomie ;

•   composants ;

•   actions ;

•   règles métier ;

•   interactions.

________________________________________

Écrans déjà développés dans le prototype technique

•   Dashboard

•   Vehicles

•   VehicleDetail

•   VehicleEdit

•   Drivers

•   DriverDetail

•   DriverEdit

•   Archives

•   Equipment

•   Expenses

Ces écrans seront harmonisés selon ce Blueprint.

________________________________________

9. Phase 2 — UX/UI

Objectif :

Concevoir FleetManager AI écran par écran jusqu'à obtenir un prototype complet prêt à développer.

La conception comprendra :

Dashboard

•   vision flotte ;

•   KPI ;

•   alertes ;

•   actions prioritaires.

Parc véhicules

•   liste ;

•   recherche ;

•   filtres ;

•   fiche véhicule.

Conducteurs

•   profils ;

•   historique ;

•   affectations.

Maintenance

•   interventions ;

•   coûts ;

•   fournisseurs.

GED

•   documents ;

•   recherche ;

•   validation IA.

KPI

•   direction ;

•   DAF ;

•   analyses.

Centre IA

•   assistant ;

•   recommandations ;

•   alertes intelligentes.

________________________________________

10. Ce qui rend FleetManager AI unique

•   IA intégrée à tous les modules.

•   Workflow métier construit à partir d'une expérience terrain réelle.

•   GED intelligente.

•   Imports massifs Excel, DKV, ULYS.

•   Historique complet des véhicules.

•   Gestion avancée assurances et sinistres.

•   Suivi complet locations.

•   Tableaux de bord décisionnels.

•   Paramétrage sans développement.

•   Architecture ouverte via API.

________________________________________

11. Roadmap produit

MVP

Objectif :

Créer un socle exploitable.

Comprend :

•   véhicules ;

•   conducteurs ;

•   affectations ;

•   équipements ;

•   dépenses de base.

________________________________________

Version 1

Ajout :

•   GED ;

•   maintenance ;

•   KPI ;

•   alertes.

________________________________________

Version 2

Ajout :

•   IA avancée ;

•   imports automatiques ;

•   connecteurs externes.

________________________________________

Version 3

Ajout :

•   SaaS complet ;

•   marketplace ;

•   automatisations avancées.

________________________________________

12. Règle de conception officielle

Avant tout développement :

1.  Décrire l'écran.

2.  Définir les composants.

3.  Définir les interactions.

4.  Valider le parcours utilisateur.

5.  Développer.

6.  Tester.

7.  Mettre à jour la documentation.

________________________________________

Statut au 31/07/2026

Fondation technique :

✅ Réalisée

Modules backend :

✅ Véhicules

✅ Conducteurs

✅ Entreprises

✅ Equipements

✅ Affectations

Frontend :

🔄 Phase d'harmonisation UX/UI

Prochaine étape :

Conception détaillée des écrans FleetManager AI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0c7af9ea-b41c-4339-94e5-98cef4ce5907).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
