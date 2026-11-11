# Déployer et utiliser la salle LiveKit pendant un cours de 3 heures

Ce dépôt contient une page HTML statique et une fonction Vercel (`api/livekit-token.js`) qui signe les jetons LiveKit côté serveur. Les clés API et le secret ne doivent jamais être placés dans `index.html`.

## Étape 1 — Protéger les identifiants exposés

Un jeton LiveKit a été partagé précédemment dans une conversation. Ne le réutilisez pas. Dans LiveKit Cloud, faites tourner/révoquez les identifiants API associés si possible. Utilisez ensuite la nouvelle API key et le nouveau secret dans Vercel. Si le tableau de bord permet de révoquer seulement l’ancien jeton, révoquez-le également.

## Étape 2 — Vérifier la salle LiveKit

Dans le tableau de bord LiveKit Cloud, ouvrez le projet correspondant à l’URL `wss://visioclass-w13jjyc.livekit.cloud`. Vérifiez que le projet est actif et que l’URL WebSocket correspond exactement. Le nom de salle utilisé par l’application est `visioclasse`; LiveKit crée généralement la salle au premier participant, selon la configuration du projet.

## Étape 3 — Configurer Vercel

Dans Vercel, ouvrez le projet lié au dépôt, puis **Settings → Environment Variables**. Ajoutez les variables ci-dessous sans guillemets. Choisissez les environnements Production et Preview concernés.

| Nom | Valeur |
| --- | --- |
| `LIVEKIT_URL` | L’URL WebSocket du projet LiveKit, par exemple `wss://visioclass-w13jjyc.livekit.cloud` |
| `LIVEKIT_API_KEY` | Une API key active créée dans LiveKit Cloud |
| `LIVEKIT_API_SECRET` | Le secret correspondant — ne le partagez pas et ne le mettez pas dans GitHub |
| `TEACHER_ACCESS_CODE` | Un code long, aléatoire et privé, choisi par vous |

Le code professeur est un code d’accès à l’application, pas une authentification Google. Ne le partagez pas aux élèves.

## Étape 4 — Redéployer

Après l’ajout ou la modification des variables, ouvrez **Deployments** et lancez **Redeploy** sur le dernier déploiement, ou poussez un nouveau commit. Vercel doit installer `livekit-server-sdk` depuis `package.json` et détecter automatiquement la fonction `/api/livekit-token`.

## Étape 5 — Tester

1. Ouvrez l’URL HTTPS Vercel dans un navigateur moderne (Chrome ou Edge récent recommandé pour le partage d’écran).
2. Connectez-vous comme professeur avec le `TEACHER_ACCESS_CODE` et autorisez le microphone.
3. Vérifiez que le nom de la salle affiché est `visioclasse`, puis lancez le partage d’écran.
4. Ouvrez l’URL dans une autre fenêtre ou sur un autre appareil. Rejoignez avec un nom d’élève et le code `visioclasse`.
5. Vérifiez l’audio, le partage d’écran, la liste des participants, le chat et la main levée.
6. Faites un essai prolongé avant un cours important; contrôlez aussi le Wi-Fi, l’alimentation et les autorisations du navigateur.

## Jetons et cours de 3 heures

Le backend émet maintenant des jetons valides 4 heures, pour laisser une marge au cours de 3 heures et à une reconnexion éventuelle. La validité du jeton n’est pas une garantie de qualité réseau ni une promesse que toute panne se rétablira sans interruption. LiveKit SDK tente de gérer les reconnexions, mais le Wi-Fi, le navigateur, les permissions et le service peuvent toujours interrompre un appel. Si un participant est déconnecté, reconnectez-le depuis la page pour obtenir un nouveau jeton.

## Développement local (facultatif)

Installez Node.js et Vercel CLI, puis lancez :

```sh
npm install
npx vercel dev
```

Définissez localement les mêmes variables d’environnement (par exemple via `.env.local`, qui est ignoré par Git) avant de démarrer. Ne commitez jamais `.env.local`.

## Limites / sécurité

- La salle est fixe (`visioclasse`).
- L’interface élève est accessible à toute personne connaissant le nom de salle; le backend ne vérifie pas l’identité réelle des élèves.
- Le code d’accès professeur est partagé par mot de passe simple. Pour une classe réelle, choisissez un code robuste et envisagez une authentification serveur dédiée.
- Le bouton de coupure des micros envoie une commande aux clients; ce n’est pas une restriction impossible à contourner. Un contrôle d’administration strict doit être mis en œuvre côté serveur.
- Aucun système ne peut garantir une visioconférence « parfaitement » stable; utilisez une connexion fiable et testez avec les appareils et réseaux qui seront employés.
