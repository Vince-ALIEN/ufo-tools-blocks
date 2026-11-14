# Architecture du plugin UFO Tools Blocks

## Structure des fichiers

```
ufo-tools-blocks/
│
├── ufo-tools-blocks.php        # Fichier principal du plugin
│   ├── ufo_tools_blocks_block_init()          # Enregistrement des 10 blocs
│   └── ufo_tools_blocks_register_category()   # Catégorie "UFO Blocks"
│
├── includes/
│   ├── class-ufo-tools-blocks-updater.php     # Mises à jour depuis les releases GitHub
│   ├── ufo-faq-schema.php                     # JSON-LD FAQPage (filtre render_block)
│   └── ufo-tools-blocks-icons.php             # ufo_get_icon_svg() (généré au build)
│
├── src/                        # Sources (avant compilation)
│   ├── icons.js                # Icônes de blocs (lucide-react)
│   ├── shared/                 # Contrôles d'inspecteur et icônes partagés
│   ├── ufo-grid/               # Conteneur de grille          (statique)
│   ├── ufo-row/                # Cellule de grille            (statique, enfant de ufo-grid)
│   ├── ufo-faq/                # FAQ + schema                 (statique)
│   ├── ufo-faq-item/           # Question / réponse           (statique, enfant de ufo-faq)
│   ├── ufo-buttons-group/      # Groupe de boutons            (statique)
│   ├── ufo-button/             # Bouton avec icône            (dynamique : render.php)
│   ├── ufo-title/              # Titre avec icône             (dynamique : render.php)
│   ├── ufo-tabs/               # Onglets                      (dynamique : render.php + view.js)
│   ├── ufo-tab/                # Un onglet                    (statique, enfant de ufo-tabs)
│   └── ufo-icon/               # Icône Lucide                 (dynamique : render.php)
│       Chaque bloc : block.json, index.js, edit.js, save.js, *.css,
│       et selon le cas shared.js, inspector.js, deprecated.js, render.php
│
├── scripts/generate-icon-svgs.js  # Génère les SVG PHP des icônes (prebuild)
│
├── tests/
│   ├── js/                     # Jest : snapshots de save(), deprecated, safelist Tailwind
│   └── php/                    # Filtre JSON-LD de ufo-faq (sans WordPress)
│
├── build/                      # Fichiers compilés (npm run build, non versionné)
│
└── Documentation
    ├── README.md
    ├── QUICKSTART.md
    ├── DEVELOPERS.md
    ├── CONTRIBUTING.md
    ├── CHANGELOG.md
    └── ARCHITECTURE.md
```

## Flux de données

### Chargement du plugin

```
WordPress init
    ↓
ufo-tools-blocks.php
    ↓
ufo_tools_blocks_block_init()
    └→ register_block_type(__DIR__ . '/build/<bloc>')   × 10

Les blocs dynamiques (button, title, icon, tabs) sont rendus par leur render.php ;
ufo-tabs construit la barre d'onglets depuis les titres des ufo-tab enfants ;
ufo-faq passe par le filtre render_block de includes/ufo-faq-schema.php,
qui ajoute le JSON-LD FAQPage construit à partir des questions/réponses.
```

### Rendu dans l'éditeur

```
Utilisateur insère un bloc ufo Grid
    ↓
Gutenberg charge build/ufo-grid/index.js
    ↓
Composant React (edit.js)
    ├→ useBlockProps()
    ├→ useInnerBlocksProps()      ← accepte uniquement ufo-row
    ├→ InspectorControls          ← panneau latéral droit
    └→ BlockControls              ← barre d'outils

Attribut modifié → setAttributes() → re-render
```

### Sauvegarde et affichage frontend

```
Utilisateur publie
    ↓
save.js retourne le JSX
    ↓
WordPress sérialise en HTML dans post_content
    ↓
Requête frontend
    ↓
HTML statique servi directement
```

## Architecture CSS

### ufo Grid

```
.ufo-grid                    (base)
.grid                        (layout CSS grid)
.grid-cols-{n}               (colonnes desktop)
.gap-{size}                  (espacement)
.items-{align}               (alignement vertical)
.ufo-grid--reverse-mobile    (inversion mobile)
.ufo-grid--boxed             (conteneur centré)
```

### ufo Row

```
.ufo-row                     (base)
.col-span-{n}                (largeur en colonnes)
.col-start-{n}               (colonne de départ)
.col-end-{n}                 (colonne de fin)
.row-span-{n}                (hauteur en lignes)
.row-start-{n}               (ligne de départ)
.row-end-{n}                 (ligne de fin)
```

## Relations entre blocs

```
ufo-grid
    └── ufo-row (1..N)   ← parent déclaré dans block.json
            └── [tout bloc WordPress]

ufo-faq
    └── ufo-faq-item (1..N)   ← parent déclaré dans block.json
            └── [tout bloc WordPress : la réponse]

ufo-buttons-group
    └── ufo-button (0..N)     ← ufo-button peut aussi être utilisé seul
```

Les blocs `ufo-row` et `ufo-faq-item` déclarent leur `parent` dans leur `block.json`, ce qui empêche leur insertion hors de leur conteneur.

## Workflow de développement

```bash
npm install          # Installer les dépendances
npm start            # Watch mode
npm run build        # Build de production
npm run lint:js      # Lint JavaScript
npm run lint:css     # Lint CSS
npm run format       # Formatter le code
npm test             # Tests Jest + test PHP du schema FAQ
npm run plugin-zip   # Générer l'archive du plugin
```

## Diagramme de composants

```
┌───────────────────────────────────────────┐
│           WordPress Gutenberg             │
├───────────────────────────────────────────┤
│                                           │
│  ┌────────────────────────────────────┐   │
│  │      UFO Tools Blocks Plugin       │   │
│  │                                    │   │
│  │  ┌──────────────────────────────┐  │   │
│  │  │  ufo Grid (conteneur)        │  │   │
│  │  │  ┌──────────────────────┐    │  │   │
│  │  │  │ ufo Row              │    │  │   │
│  │  │  │  [InnerBlocks WP]    │    │  │   │
│  │  │  └──────────────────────┘    │  │   │
│  │  │  ┌──────────────────────┐    │  │   │
│  │  │  │ ufo Row              │    │  │   │
│  │  │  │  [InnerBlocks WP]    │    │  │   │
│  │  │  └──────────────────────┘    │  │   │
│  │  └──────────────────────────────┘  │   │
│  │                                    │   │
│  └────────────────────────────────────┘   │
│                                           │
└───────────────────────────────────────────┘
```

---

**Maintenu par UFO Agency**
