# Architecture du plugin UFO Tools Blocks

## Structure des fichiers

```
ufo-tools-blocks/
│
├── ufo-tools-blocks.php        # Fichier principal du plugin
│   ├── ufo_tools_blocks_block_init()          # Enregistrement des 13 blocs
│   └── ufo_tools_blocks_register_category()   # Catégorie "UFO Blocks"
│
├── includes/
│   ├── class-ufo-tools-blocks-updater.php     # Mises à jour depuis les releases GitHub
│   ├── ufo-faq-schema.php                     # JSON-LD FAQPage (appelé par ufo-faq/render.php)
│   ├── ufo-tools-blocks-classes.php           # Classes Tailwind (portage PHP des shared.js)
│   ├── ufo-tools-blocks-render.php            # Aides des render.php (ancien format, fond, marqueur de frise)
│   ├── ufo-tools-blocks-extensions.php        # Réglages ajoutés aux blocs core (marge haute de core/image)
│   ├── ufo-tools-blocks-rest.php              # Routes ufo-tools-blocks/v1 (guide, check)
│   └── ufo-tools-blocks-icons.php             # ufo_get_icon_svg() (généré au build)
│
├── src/                        # Sources (avant compilation)
│   ├── icons.js                # Icônes de blocs (lucide-react)
│   ├── shared/                 # Contrôles d'inspecteur et icônes partagés
│   ├── extensions/             # Réglages ajoutés aux blocs core (core/image : marge haute)
│   ├── ufo-grid/               # Conteneur de grille          (dynamique : render.php)
│   ├── ufo-row/                # Cellule de grille            (dynamique, enfant de ufo-grid)
│   ├── ufo-faq/                # FAQ + schema                 (dynamique : render.php)
│   ├── ufo-faq-item/           # Question / réponse           (dynamique, enfant de ufo-faq)
│   ├── ufo-buttons-group/      # Groupe de boutons            (dynamique : render.php)
│   ├── ufo-button/             # Bouton avec icône            (dynamique : render.php)
│   ├── ufo-title/              # Titre avec icône             (dynamique : render.php)
│   ├── ufo-tabs/               # Onglets                      (dynamique : render.php + view.js)
│   ├── ufo-tab/                # Un onglet                    (dynamique, enfant de ufo-tabs)
│   ├── ufo-heading-group/      # Étiquette + titre de section (dynamique : render.php)
│   ├── ufo-time-line/          # Frise chronologique          (dynamique : render.php)
│   ├── ufo-time-line-item/     # Une étape de frise           (dynamique, enfant de ufo-time-line)
│   └── ufo-icon/               # Icône Lucide                 (dynamique : render.php)
│       Chaque bloc : block.json, index.js, edit.js, save.js, *.css,
│       et selon le cas shared.js, inspector.js, deprecated.js, render.php
│
├── docs/blocs-pour-ia.md       # Guide pour les assistants IA (copié dans build/)
│
├── tailwind/ufo-tools-blocks.css  # Sources Tailwind pour le thème (@source de build/ + safelist), copié dans build/tailwind.css, importé par le thème
│
├── scripts/
│   ├── generate-icon-svgs.js   # Génère les SVG PHP des icônes (prebuild)
│   └── check-rendering.php     # Rendu front de tous les contenus (wp eval-file), avant / après
│
├── tests/
│   ├── fixtures/               # Contenus enregistrés en 1.0.8 et leur version migrée
│   ├── js/                     # Jest : format enregistré, deprecated, migrations, classes JS = PHP, exemples, safelist
│   └── php/                    # JSON-LD de ufo-faq, pont PHP du test des classes
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
    └→ register_block_type(__DIR__ . '/build/<bloc>')   × 13

Tous les blocs sont rendus par leur render.php (depuis la 1.1.0) ;
les blocs à enfants enveloppent $content (rendu des enfants, déjà calculé par
WordPress) ; un contenu encore enregistré dans l'ancien format statique
(≤ 1.0.8) est affiché tel quel ($content contient déjà son enveloppe) ;
ufo-tabs construit la barre d'onglets depuis les titres des ufo-tab enfants ;
ufo-faq ajoute le JSON-LD FAQPage construit à partir des questions/réponses
(includes/ufo-faq-schema.php).
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
save.js retourne <InnerBlocks.Content /> : post_content ne contient que les
commentaires de blocs (attributs) et les blocs enfants
    ↓
Requête frontend
    ↓
render.php calcule classes et enveloppe à partir des attributs
(includes/ufo-tools-blocks-classes.php, mêmes classes que shared.js)

Contenu enregistré avant la 1.1.0 : reconnu dans l'éditeur par deprecated.js
(copie figée du save() de la 1.0.8), migré à la prochaine sauvegarde.
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

ufo-time-line
    └── ufo-time-line-item (1..N)   ← parent déclaré dans block.json
            └── [tout bloc WordPress : le détail de l'étape]

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
