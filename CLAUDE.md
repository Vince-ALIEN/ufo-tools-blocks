# Ufo Tools Blocks

## Style de code : WordPress, obligatoire

Tout le code suit les WordPress Coding Standards. Vincent travaille sur plusieurs ordinateurs : le style est fixé par les fichiers du dépôt, pas par les réglages d'un poste.

- JS : wp-prettier avec `@wordpress/prettier-config` (`.prettierrc.js`) : tabulations, guillemets simples, espaces dans les parenthèses (`foo( bar )`, `[ a, b ]`, `{ a }`).
- CSS : stylelint (`wp-scripts lint-style`). Prettier ignore le CSS (`.prettierignore`).
- JSON, YAML, Markdown : 2 espaces (override dans `.prettierrc.js`, `.editorconfig`).
- PHP : WordPress Coding Standards (tabulations, espaces dans les parenthèses).
- Avant de commiter du JS ou du CSS : `npm run check:style` (aussi lancé par `npm test`). Pour corriger : `npm run format` (JS), `npx wp-scripts lint-style 'src/**/*.css' --fix` (CSS).
- Un reformatage de masse va dans un commit à part, ajouté ensuite (hash complet) à `.git-blame-ignore-revs`.

Réglage d'un nouveau poste : voir CONTRIBUTING.md, section « Réglage de chaque ordinateur ».
