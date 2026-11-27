# UFO Tools Blocks

**A WordPress Gutenberg plugin providing a powerful CSS Grid layout system and content blocks built with Tailwind CSS v4.**

No page builder. No bloat. Just clean, semantic markup with full CSS Grid control — directly inside the block editor.

> Built and battle-tested by [UFO Agency](https://ufo-agency.com) across 30+ client sites.

---

## Why ufo-tools-blocks?

Gutenberg's native columns block is limited. Page builders are overkill. `ufo-tools-blocks` gives you a proper CSS Grid system — with `col-span`, `col-start`, `row-span`, background images, background videos, responsive reordering, and more — all configurable from the block sidebar without writing a single line of CSS.

It pairs with your Tailwind CSS v4 theme: the plugin ships no CSS of its own, staying lean and letting your theme's design tokens drive the visual output.

---

## Available blocks

| Block | Block name | Description |
|---|---|---|
| ufo Grid | `ufo-blocks/ufo-grid` | Responsive CSS Grid container |
| ufo Row | `ufo-blocks/ufo-row` | Grid cell (direct child of ufo Grid) |
| UFO Button | `ufo-blocks/ufo-button` | Customizable button with Lucide icons |
| ufo Buttons | `ufo-blocks/ufo-buttons-group` | Button group with alignment control |
| ufo FAQ | `ufo-blocks/ufo-faq` | FAQ accordion with Schema.org JSON-LD |
| ufo FAQ Item | `ufo-blocks/ufo-faq-item` | Question/answer item (child of ufo FAQ) |
| UFO Icon | `ufo-blocks/ufo-icon` | Lucide icon with alignment and theme color |
| ufo Title | `ufo-blocks/ufo-title` | Title with icon and rounded background |
| UFO Heading Group | `ufo-blocks/ufo-heading-group` | Tag (short paragraph) above a section heading |
| Ufo Tabs | `ufo-blocks/ufo-tabs` | Underlined tabs (keyboard accessible); each tab is a `ufo-blocks/ufo-tab` |
| UFO Timeline | `ufo-blocks/ufo-time-line` | Vertical timeline; each step is a `ufo-blocks/ufo-time-line-item` (date, title, icon, free content) |

Since 1.1.0 every block is rendered on the server (`render.php`): saved content only holds block comments with their attributes and the inner blocks, so it can no longer become "unexpected or invalid", whoever writes it (editor, import, AI assistant). Content saved by 1.0.8 and earlier is displayed unchanged and switches to the new format the next time it is saved in the editor.

### For AI assistants

Each `block.json` has an `example`, published by `GET /wp-json/wp/v2/block-types?namespace=ufo-blocks&context=edit`. For users who can edit posts (`edit_posts`), the plugin also adds:

- `GET /wp-json/ufo-tools-blocks/v1/guide`: usage guide (Markdown, [`docs/blocs-pour-ia.md`](docs/blocs-pour-ia.md), in French) and installed version;
- `POST /wp-json/ufo-tools-blocks/v1/check` with `{ "content": "…" }`: checks block markup without saving it (unknown blocks, parents, undeclared attributes, types and `enum`, malformed comments).

The `ufo-blocks/ufo-bento`, `ufo-blocks/ufo-time` and `ufo-blocks/logo-slider` blocks now live in their own plugins, **ufo-tools-bento**, **ufo-tools-time** and **ufo-tools-logo-slider** (same block names, existing content stays valid).

## Installation

### Requirements

- WordPress 6.1+
- PHP 7.4+
- Node.js 18+ and npm
- **A theme using Tailwind CSS v4** (see [Tailwind integration](#tailwind-css-v4-integration) below)

### Steps

1. Clone the repository into `wp-content/plugins/`
   ```bash
   cd wp-content/plugins
   git clone https://github.com/Vince-ALIEN/ufo-tools-blocks.git
   cd ufo-tools-blocks
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build the plugin
   ```bash
   npm run build
   ```

4. Activate the plugin in **WordPress Admin → Plugins → UFO Tools Blocks**

### Installing from a release

To deploy without building, download `ufo-tools-blocks.zip` from the [latest release](https://github.com/Vince-ALIEN/ufo-tools-blocks/releases/latest) and upload it in **Plugins → Add New → Upload Plugin**. Installed this way, the plugin then updates itself from GitHub releases like any other plugin (the updater stays off on a git clone, so a development checkout is never overwritten).

### Migrating from ufo-blocks

This plugin was called `ufo-blocks` up to 1.8.0. Install and activate `ufo-tools-blocks` (activation deactivates `ufo-blocks`), delete `ufo-blocks`, and update the `@source` paths of your theme. Block names stay `ufo-blocks/*`, so existing content keeps working.

### Publishing a release

Bump the version in `ufo-tools-blocks.php`, `package.json` and `CHANGELOG.md`, update [`docs/blocs-pour-ia.md`](docs/blocs-pour-ia.md) (markup changes, accepted values), commit, then push the matching tag. The `Release` workflow builds the zip and attaches it to the GitHub release.

```bash
git tag v1.6.0 && git push origin v1.6.0
```

## Tailwind CSS v4 Integration

`ufo-tools-blocks` ships no CSS. It is designed to work with a theme that already runs Tailwind CSS v4.

Add the following directives to your theme's CSS entry point so Tailwind scans the plugin's source files and includes all required utility classes in the build:

```css
/**
 * Add your plugins folder
 */
@source "../../../plugins/ufo-tools-blocks/src/**/*.js";
@source "../../../plugins/ufo-tools-blocks/src/**/*.php";

@source inline("{sm,md,lg,xl}:col-span-{1,2,3,4,5,6}");
@source inline("col-span-{1,2,3,4,5,6}");
@source inline("{sm,md,lg,xl}:col-start-{1,2,3,4,5,6,7}");
@source inline("col-start-{1,2,3,4,5,6,7}");
@source inline("{sm,md,lg,xl}:col-end-{1,2,3,4,5,6,7,8}");
@source inline("col-end-{1,2,3,4,5,6,7,8}");
@source inline("row-span-{1,2,3,4,5,6}");
@source inline("row-start-{1,2,3,4,5,6,7}");
@source inline("row-end-{1,2,3,4,5,6,7}");

/* ufo-grid & ufo-row — fixed height (also used by the "Hauteur minimale" setting) */
@source inline("h-{24,32,40,48,56,64,72,80,96,120,150}");

@source inline("gap-{0,1,2,3,4,5,6,7,8}");
@source inline("grid-cols-{1,2,3,4,5,6}");
@source inline("{sm,md,lg,xl}:grid-cols-{1,2,3,4,5,6}");
@source inline("{sm,md,lg,xl}:{grid,auto-rows-fr,h-screen}");
@source inline("auto-rows-fr");
@source inline("grid-rows-{1,2,3,4,5,6}");
@source inline("px-{0,2,4,6,8,10,12,14,16}");
@source inline("py-{0,2,4,6,8,10,12,14,16}");
@source inline("min-h-{32,48,64,80,96,192}");
@source inline("rounded-{sm,md,lg,xl,2xl,3xl}");
```

The `@source inline(...)` directives are required for dynamically generated classes (e.g. `md:col-span-3`) that Tailwind cannot detect through file scanning alone.

### Starter themes

Need a Tailwind CSS v4 + WordPress starter? Both of these handle the Tailwind + Gutenberg wiring out of the box and work seamlessly with `ufo-tools-blocks`:

- **[_tw](https://underscoretw.com/)** — A minimal `_s`-based starter theme with Tailwind CSS. Clean, unopinionated, easy to extend.
- **[TailPress](https://tailpress.io/)** — A block-theme starter with full Tailwind CSS v4 integration, FSE support, and a ready-to-use build pipeline.

## Usage

### Development

```bash
npm start       # Watch mode with auto-reload
npm run build   # Production build
```

### In the block editor

1. Click **"+"** to add a block
2. Search for the block under the **"UFO Blocks"** category
3. Configure via the sidebar panel

## Attribute reference

### ufo Grid (`ufo-blocks/ufo-grid`)

CSS Grid container. Only accepts `ufo Row` blocks as direct children.

| Attribute | Type | Default | Description |
|---|---|---|---|
| columnsCount | number | 2 | Number of columns (from `breakpoint` up) |
| breakpoint | string | 'md' | Width from which cells form columns (`sm`, `md`, `lg`, `xl`; `none` = at every width, unprefixed classes); below it they stack. Also the prefix of the cells' `col-span` / `col-start` / `col-end` |
| rowsCount | number | 0 | Number of rows (0 = auto) |
| gap | string | '4' | Gap between cells (0–8) |
| verticalAlignment | string | '' | Vertical alignment of cells |
| reverseMobile | boolean | false | Reverse order on mobile |
| equalRows | boolean | true | Equal row heights (`auto-rows-fr`). `true` when absent, for grids already saved; new grids inserted in the editor (any layout but the mosaic) and grids converted from `core/columns` get `false` explicitly, and "Reset all" sets it to `false`. |
| minHeight | string | '' | Minimum height |
| borderRadius | string | '' | Border radius |
| isBoxed | boolean | false | Centered container with max-width |
| backgroundImage | object | — | Background image (url, id, alt) |
| backgroundSize | string | 'cover' | Background image size |
| backgroundPosition | string | 'center center' | Background image position |
| backgroundVideo | object | — | Background video (url, id) |
| paddingX | string | '0' | Horizontal padding (0–16) |
| paddingY | string | '0' | Vertical padding (0–16) |

### ufo Row (`ufo-blocks/ufo-row`)

Grid cell. Must be a direct child of `ufo Grid`.

| Attribute | Type | Default | Description |
|---|---|---|---|
| colSpan | string | '' | Number of columns spanned |
| colStart | string | '' | Starting column |
| colEnd | string | '' | Ending column |
| rowSpan | string | '' | Number of rows spanned |
| rowStart | string | '' | Starting row |
| rowEnd | string | '' | Ending row |
| verticalAlignment | string | '' | Vertical alignment of content |
| minHeight | string | '' | Minimum height |
| height | string | '' | Fixed height |
| paddingX | string | '0' | Horizontal padding (0–16) |
| paddingY | string | '0' | Vertical padding (0–16) |
| borderRadius | string | '' | Border radius |
| backgroundImage | object | — | Background image (url, id, alt) |
| backgroundSize | string | 'cover' | Background image size |
| backgroundPosition | string | 'center center' | Background image position |

## File structure

```
ufo-tools-blocks/
├── build/                    # Compiled files (generated by npm run build)
├── includes/
│   ├── ufo-tools-blocks-icons.php # SVG helpers for the button block
│   └── ufo-faq-schema.php    # Schema.org JSON-LD for FAQ
├── tests/                    # Jest (js/) and PHP (php/) tests
├── src/
│   ├── shared/               # Shared utilities across blocks
│   ├── ufo-grid/             # Grid container block
│   │   ├── block.json
│   │   ├── shared.js         # getWrapperClasses(), getInnerClasses(), getWrapperStyle()
│   │   ├── inspector.js
│   │   ├── edit.js / save.js
│   │   └── editor.css / style.css
│   ├── ufo-row/              # Grid cell block
│   │   ├── block.json
│   │   ├── shared.js         # getTailwindClasses(), getBlockStyle()
│   │   ├── inspector.js
│   │   ├── edit.js / save.js / deprecated.js / render.php
│   │   └── editor.css / style.css
│   ├── ufo-button/           # Button with Lucide icon
│   ├── ufo-buttons-group/    # Button group
│   ├── ufo-faq/              # FAQ accordion + Schema.org
│   ├── ufo-faq-item/         # FAQ item
│   ├── ufo-icon/             # Lucide icon
│   ├── ufo-title/            # Title with icon
│   ├── ufo-tabs/             # Tabs (render.php + view.js)
│   ├── ufo-tab/              # One tab (child of ufo-tabs)
│   ├── ufo-heading-group/    # Tag above a section heading
│   ├── ufo-time-line/        # Vertical timeline
│   ├── ufo-time-line-item/   # One step (child of ufo-time-line)
│   └── icons.js
├── ufo-tools-blocks.php      # Main plugin file
├── package.json
└── webpack.config.js
```

## NPM commands

| Command | Description |
|---|---|
| `npm start` | Development mode with watch |
| `npm run build` | Production build |
| `npm run format` | Code formatting |
| `npm run lint:css` | CSS linting |
| `npm run lint:js` | JavaScript linting |
| `npm run plugin-zip` | Generate plugin archive |
| `npm test` | Unit tests (Jest) and the FAQ schema PHP test |
| `npm run test:unit -- -u` | Update snapshots after a deliberate change |
| `UPDATE_FIXTURES=1 npm run test:unit` | Regenerate `tests/fixtures/migrated/` after a deliberate change |

### Tests

- `tests/js/save.test.js`: snapshots of the current saved format (comments and inner blocks only) and of the frozen 1.0.8 markup kept in each `deprecated.js`; every `deprecated` version must still parse and migrate. The 1.0.8 snapshots must never change, or published content would show "This block contains unexpected or invalid content".
- `tests/js/legacy-content.test.js`: content saved by 1.0.8 and earlier (`tests/fixtures/*.html`) opens valid, migrates without losing FAQ questions, anchors or settings, and its migrated version (`tests/fixtures/migrated/`) is up to date and stable.
- `tests/js/classes-php.test.js`: the editor (`src/*/shared.js`) and the server (`includes/ufo-tools-blocks-classes.php`) produce the same classes for every inspector value (runs `php`).
- `tests/js/block-examples.test.js`: every `block.json` `example` is valid content.
- `tests/js/tailwind-safelist.test.js`: every class the inspector settings can generate must be either written as-is in `src/` or listed in the `@source inline(...)` safelist above. Extend the safelist when you add a value.
- `tests/php/test-faq-schema.php`: the `ufo-faq` JSON-LD, run without WordPress (`php` 7.4+ required).

The release workflow runs `npm test` before building the zip. The `Contrôles` workflow (`.github/workflows/checks.yml`) runs on every push to `main` and every pull request: tests and style, `npm audit --omit=dev`, PHPCS WordPress security sniffs, PHP 7.4 compatibility, gitleaks on the whole history, and Plugin Check (security, general) on the contents of the release zip.

Front-end check on a copy of a site, before and after an update (`diff` must be empty; also renders the fixtures and their migrated version, which must match):

```bash
ddev wp eval-file wp-content/plugins/ufo-tools-blocks/scripts/check-rendering.php /var/www/html/wp-content/uploads/ufo-check/avant
# update the plugin
ddev wp eval-file wp-content/plugins/ufo-tools-blocks/scripts/check-rendering.php /var/www/html/wp-content/uploads/ufo-check/apres
diff -r wp-content/uploads/ufo-check/avant wp-content/uploads/ufo-check/apres
```

## Further reading

- [How to build custom Gutenberg blocks with Tailwind CSS](https://www.ufo-agency.com/news/comment-creer-des-blocs-wordpress-gutenberg-sur-mesure-avec-tailwind-css/) *(French)*

## Compatibility

- WordPress 6.1+
- PHP 7.4+
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

GPL v2 or later

## Author

**UFO Agency** — [ufo-agency.com](https://ufo-agency.com)

Issues & contributions welcome → [GitHub Issues](https://github.com/Vince-ALIEN/ufo-tools-blocks/issues)
