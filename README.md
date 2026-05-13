# Les Jardins Enchantés

> Boutique en ligne premium dédiée à l'univers intime de luxe.
>
> [![Site](https://img.shields.io/badge/site-jl--shop--06.vercel.app-caa86a)](https://jl-shop-06.vercel.app)
> [![Stripe](https://img.shields.io/badge/paiement-Stripe-635bff)](https://stripe.com)
> [![Vercel](https://img.shields.io/badge/deploy-Vercel-000000)](https://vercel.com)
>
> ---
>
> ## Présentation
>
> **Les Jardins Enchantés** (JL Shop 06) est une boutique en ligne proposant une sélection de produits intimes haut de gamme : gels lubrifiants aromatisés, vibromasseurs, masturbateurs et accessoires de luxe. L'univers visuel repose sur une charte sobre et élégante (noir profond et or `#caa86a`).
>
> Site en production : **https://jl-shop-06.vercel.app**
>
> ## Stack technique
>
> - **Frontend** : HTML5, CSS3, JavaScript vanilla
> - - **Paiement** : Stripe Checkout (sessions hébergées)
>   - - **Backend serverless** : Node.js sur Vercel (`api/stripe/checkout.js`)
>     - - **Déploiement** : Vercel
>       - - **Stockage panier** : `localStorage` côté client
>        
>         - ## Structure du projet
>        
>         - ```
>           .
>           ├── index.html                  # Page d'accueil + grille produits
>           ├── style.css                   # Charte graphique globale
>           ├── cart.js                     # Système de panier unifié (localStorage + modal)
>           ├── api/stripe/checkout.js      # Endpoint serverless Stripe Checkout
>           ├── vercel.json                 # Configuration de déploiement Vercel
>           ├── package.json                # Dépendance stripe
>           │
>           ├── *.html                      # Pages produits (1 fichier par produit)
>           ├── success.html / cancel.html  # Retour Stripe
>           ├── erreur.html                 # Page d'erreur générique
>           │
>           ├── cgv.html                    # Conditions générales de vente
>           ├── confidentialite             # Politique de confidentialité (RGPD)
>           ├── cookies.html                # Politique cookies
>           ├── mentions-legales            # Mentions légales
>           ├── SECURITY.md                 # Politique de sécurité
>           │
>           └── *.jpg                       # Visuels produits
>           ```
>
> ## Fonctionnement du panier
>
> Chaque bouton « AJOUTER » porte les attributs :
>
> ```html
> <button class=\"add-to-cart\"
>         data-product-id=\"price_xxx\"
>         data-product-name=\"Nom du produit\"
>         data-product-price=\"12.90\">
>   AJOUTER
> </button>
> ```
>
> `cart.js` :
>
> 1. Écoute tous les boutons `.add-to-cart[data-product-id]`
> 2. 2. Stocke l'article (`id`, `name`, `price`, `priceId`) dans `localStorage`
>    3. 3. Met à jour le compteur du header et ouvre une modale stylée
>       4. 4. Le bouton **PAYER** envoie le panier à `/api/stripe/checkout`
>          5. 5. Stripe Checkout redirige vers `success.html` ou `cancel.html`
>            
>             6. ## Variables d'environnement
>            
>             7. À configurer sur Vercel :
>            
>             8. | Variable | Description |
> |---|---|
> | `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_...` ou `sk_test_...`) |
>
> ## Développement local
>
> ```bash
> # Installer les dépendances
> npm install
>
> # Lancer en local avec Vercel CLI
> npx vercel dev
> ```
>
> Le site est ensuite accessible sur `http://localhost:3000`.
>
> ## Déploiement
>
> Tout push sur la branche `main` déclenche un déploiement Vercel automatique.
>
> ```bash
> git push origin main
> ```
>
> ## Sécurité
>
> Le projet suit une politique de sécurité documentée — voir [SECURITY.md](./SECURITY.md). Toute vulnérabilité doit être signalée de manière responsable.
>
> ## Mentions légales
>
> - **Public visé** : exclusivement adulte (18+).
> - - **CGV** : voir `cgv.html`
>   - - **RGPD** : voir `confidentialite`
>     - - **Mentions légales** : voir `mentions-legales`
>      
>       - ## Licence
>      
>       - © Les Jardins Enchantés – Tous droits réservés.
>       - Le code source est privé et propriétaire ; les visuels produits restent la propriété de leurs ayants droit respectifs.
>       - 
