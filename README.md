# LampeOnline — BO Creation

Plateforme e-commerce interactive spécialisée dans les luminaires et lampes d'intérieur haut de gamme (marché : Tunisie, devise : TND).

Logo officiel : **BO Creation** (`apps/web/public/assets/bo-creation-logo.png`).

---

## 🌟 Fonctionnalités

### 1. Visiteur
- Showroom interactif avec **lampe 3D Hero** (orientable au curseur, allumage en temps réel)
- Catalogue complet avec recherche, filtres par catégorie, tri et pagination (état synchronisé dans l'URL)
- Fiche produit avec **visualiseur 3D interactif** (rotation 360°, allumage / extinction, curseur de température de couleur de 2700K chaud à 6500K froid)
- Panier d'achat local (conservé et fusionné automatiquement lors de la connexion)
- Passerelle de commande (invite à la connexion/inscription pour finaliser l'achat)

### 2. Client
- Authentification par formulaire email/mot de passe ou compte Google (mock dev inclus)
- Liste de souhaits (coups de cœur) avec animation
- Tunnel de commande en 2 étapes avec adresse de livraison en Tunisie
- Règlement par carte bancaire de test simulée ou paiement en espèces à la livraison
- Suivi de commande avec frise chronologique d'acheminement (`PENDING` → `PAID` → `SHIPPED` → `DELIVERED`)
- Espace personnel (`/account`) : vue d'ensemble, historique des commandes, liste de souhaits, modification du profil et du mot de passe

### 3. Administrateur (`/admin`)
- **Tableau de bord statistique** : chiffre d'affaires, commandes, visites uniques, taux de conversion (sur 7, 30 ou 90 jours) avec graphiques Recharts (fréquentation quotidienne et tunnel de conversion)
- Alertes de stock faible (≤ 5 unités) et commandes récentes
- **Gestion des produits** : création, modification, archivage sécurisé et gestion des paramètres 3D
- **Gestion des commandes** : mise à jour des statuts et export au format CSV
- **Gestion des clients** : consultation des dépenses totales et blocage/déblocage de comptes

---

## 🏗️ Architecture technique

```
lampe_project/
├── apps/
│   ├── web/          # React 18 + Vite + TypeScript + Tailwind + Three.js / R3F + TanStack Query
│   └── api/          # Node 24 + Express + TypeScript + Prisma + SQLite (dev) + Argon2id + JWT
├── packages/
│   └── shared/       # Schémas Zod partagés et types TypeScript stricts
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js (v20+)
- pnpm (v9+)

### 2. Installation
```bash
pnpm install
```

### 3. Base de données & Seed
```bash
# Générer le client Prisma et synchroniser la base SQLite
pnpm --filter api exec prisma db push

# Charger les données de démonstration (20 luminaires, catégories, commandes, analytics)
pnpm db:seed
```

### 4. Lancement en développement
```bash
pnpm dev
```
- Frontend Web : `http://localhost:5173`
- Backend API : `http://localhost:4000`

---

## 🔑 Identifiants pré-configurés

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@lampeonline.tn` | `Admin@123456` |
| **Client démo 1** | `client1@example.com` | `Client@123456` |
| **Client démo 2** | `client2@example.com` | `Client@123456` |
| **Client bloqué** | `client3@example.com` | `Client@123456` |

---

## 💳 Cartes bancaires de test (Paiement simulé)

| Numéro de carte | Comportement |
|---|---|
| `4242 4242 4242 4242` | Paiement accepté immédiatement |
| `4000 0000 0000 0002` | Paiement refusé |
| `4000 0000 0000 3220` | Simulation de vérification additionnelle (3s) puis succès |

---

## 🧪 Tests & Vérification

```bash
# Contrôle statique TypeScript strict
pnpm typecheck

# Exécution de la suite de tests (Vitest + Supertest)
pnpm test

# Build de production
pnpm build
```
