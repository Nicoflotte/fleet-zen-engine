# FleetManager AI — refonte des modules (v1.2)

## 1. Tableau de bord

- Barre de filtres en haut : **Mois / Année** et **Société** (les 8 entités), avec option « Toutes ».
- Tous les KPI et cartes deviennent cliquables et renvoient vers le bon module, avec le filtre transmis :
  - Véhicules → Parc véhicules (État du parc)
  - Maintenance → Alertes prioritaires (à effectuer / en cours)
  - Conducteurs → module Conducteurs
  - Dépenses → Dépenses par types
- Bloc alertes prioritaires : contrôle technique, contrôle pollution, fin de garantie, fin de crédit-bail / LOA, nouvelle carte grise après fin de LOA.
- KPI alimentés aussi par Sinistres, Locations (seuls les **VP** affichés au tableau de bord), Contraventions, Assurances.

## 2. Module Agences / Entités

Regroupe les 8 entités et leurs agences localisées, en **vue cartes + vue tableau** :

- METALUMINE
- ODESA (Omnium Désamiantage)
- ODEV (Omnium Développement)
- SIP / OMNIUM FAÇADES : OF 06 Vallauris, OF 11 Narbonne, OF 13 Marseille, OF 34 Castries, OF 83 Toulon
- SATE : SATE 06 Vallauris, SATE 13 Marseille
- SUD EST ETANCHEITE : SEE 06 Vallauris, SEE 13 Marseille, SEE 34 Castries, SEE 83 Toulon
- OMNIUM SOLUTION TCE : TCE 06 Vallauris, TCE 13 Marseille
- ENTREPRISE VENTRE : VENTRE 06 Vallauris, VENTRE 13 Marseille

Chaque agence affiche ses véhicules, conducteurs et équipements rattachés.

## 3. Parc véhicules

- Bouton de bascule **Tableau / Cartes**. Le tableau ajoute le **conducteur affecté**, l'agence et l'entité.
- Catégories ramenées à **VP, VU, 2 ROUES**.
- Les véhicules en **location sortent du parc** et basculent dans le module Locations.
- **Nouveau véhicule** : scan de la carte grise (photo ou PDF) analysé par IA, qui pré-remplit immatriculation, marque, modèle, date de 1re mise en circulation, énergie, puissance, PTAC, poids à vide / hors charge, places, VIN, n° de formule et **n° de nomenclature (code national d'identification du type)**. Champs restant modifiables avant validation.

## 4. Conducteurs

- **Adresse postale complète** mise en avant (utile pour la désignation ANTAI).
- Bouton de bascule **Tableau / Cartes** ; le tableau affiche l'**immatriculation du véhicule affecté**.
- Scan du permis conservé (extraction IA réelle).

## 5. Équipements (placé entre Conducteurs et Affectations)

- Répertorie uniquement **cartes DKV, cartes TotalEnergies et badges Ulys**.
- Colonnes : agence/entité, immatriculation, conducteur affecté, échéance.
- Bascule **Tableau / Cartes**.

## 6. Affectations

- Une opération relie **véhicule → agence → conducteur → équipements** (jusqu'à 3 cartes carburant + badge Ulys par conducteur).
- Tableau récapitulatif : immatriculation, conducteur, cartes et badges affectés.
- Met à jour Véhicules, Conducteurs et Équipements + historisation.

## 7. Dépenses

- Retrait de Assurances, Locations, Sinistres, Contraventions : ces postes deviennent des modules dédiés reliés aux KPI du tableau de bord.
- Reste : **Dépenses par types** (carburant, entretien, pneumatiques, péages, Loyers regroupant crédits-baux/LOA…).

## 8. Nettoyage

- Suppression du module **Archives** : chaque module reçoit un onglet **Historique** et un filtre **« Archivé »**.

## 9. Nouveaux modules (structure + écrans de suivi)

- **Sinistres** : suivi des sinistres par véhicule/conducteur.
- **Locations** : suivi de toutes les locations (dashboard = VP uniquement).
- **Contraventions** : suivi et désignation ANTAI.
- **Assurances** : contrats et échéances.
- **Crédits-baux / LOA** : tous les échéanciers, comptabilisés en Loyers dans Dépenses, avec alertes de fin.

## Détails techniques

- Navigation réordonnée : Tableau de bord · Agences · Parc véhicules · Conducteurs · Équipements · Affectations · Dépenses · Locations · Sinistres · Contraventions · Assurances · Crédits-baux.
- Store central `src/lib/fleet-store.tsx` étendu : entités, agences, catégories VP/VU/2R, équipements multiples par conducteur, statut archivé, historique par module.
- Bascule tableau/cartes : composant réutilisable `ViewToggle` + persistance du choix par module.
- Filtres du tableau de bord propagés en **search params** typés (mois, année, société) pour être transmis aux modules ciblés.
- **Extraction IA réelle** (carte grise + permis) : activation de Lovable Cloud, upload du fichier, puis appel d'un modèle vision via l'AI Gateway dans un `createServerFn`, retour JSON structuré pré-remplissant le formulaire. Aucun champ n'est validé sans revue humaine.
- Les données métier restent, pour cette étape, dans le store applicatif ; seule l'extraction IA passe par le backend. La persistance en base sera l'étape suivante.
