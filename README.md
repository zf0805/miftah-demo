# Miftah — la mainlevée, en confiance

Démonstration interactive du cycle de mainlevée bancaire. Le projet réunit dans une seule application les trois vues du POC MLV·SECURE : chargé de crédit, responsable bancaire et vérification publique.

**Adresse de présentation :** à définir avec un domaine qui ne contient ni nom personnel ni `chatgpt.site`.

Chaque visiteur démarre avec les données fictives de démonstration ; les dossiers qu'il crée restent dans son propre navigateur.

## Accès de démonstration

| Vue | Identifiant | Mot de passe |
| --- | --- | --- |
| Chargé de crédit — Ahmed Bensalem | `ahmed.bensalem` | `Miftah2026!` |
| Responsable bancaire — Khalid Amrani | `k.amrani` | `Miftah2026!` |
| Vérification publique — 7 profils partenaires | Aucun | Aucun |

Les champs sont préremplis pour faciliter la présentation. Tous les noms et contacts sont fictifs.

## Parcours conseillé

1. Connectez-vous en chargé de crédit. Créez une mainlevée, renseignez le débiteur, le crédit remboursé et la garantie, puis déclarez les deux justificatifs.
2. Enregistrez le brouillon, ouvrez le dossier, puis transmettez-le.
3. Passez au responsable bancaire via le menu du compte. Retrouvez le dossier dans la file de décision et approuvez-le, ou testez le rejet motivé sur un autre dossier.
4. Revenez au chargé pour la signature simulée, puis au responsable pour la cosignature.
5. Passez à la vérification publique et recherchez la référence émise. L’attestation peut être imprimée en PDF et comporte un QR de vérification.

Référence déjà émise pour une démo rapide : `MLV-2026-0142`. Référence invalide à tester : `MLV-2026-9999`.

## Fonctions

- Dossiers fictifs persistés dans le navigateur, recherche et filtre par statut.
- Formulaire guidé, validation des champs, contrôle des deux justificatifs avant transmission.
- File de décision, approbation, rejet motivé, correction et nouvelle transmission.
- Double signature simulée et génération d’une référence de contrôle.
- Attestation imprimable, lien de vérification et QR code.
- Vérification publique réservée aux attestations émises, sept contextes de consultation.
- Journal d’activité, indicateurs, export CSV et réinitialisation de la démonstration.

## Lancer localement

Ouvrez `index.html` dans un navigateur moderne ou servez ce dossier avec un serveur HTTP statique. Les fichiers `index.html`, `styles.css`, `app.js` et `logo.svg` doivent être placés ensemble.

## Portée de la démo

Cette version statique conserve ses données dans `localStorage` : les vues partagent le même état entre onglets du même navigateur, mais pas entre appareils. Les identifiants ne constituent pas une authentification sécurisée. Les signatures, justificatifs et attestations sont simulés et n’ont aucune valeur bancaire ou juridique. Une mise en production demanderait une API, une base de données, des contrôles d’accès côté serveur, un registre d’audit, la gestion sécurisée des documents et de vraies signatures électroniques.
