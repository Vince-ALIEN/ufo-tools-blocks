const path = require("path");

// @wordpress/scripts 36+ ne fournit plus Jest ni sa configuration : le
// préréglage publié @wordpress/jest-preset-default et babel-jest les
// remplacent (wp-scripts test-unit-jest, docs/vitest-migration.md).
const babelTransform = [
  "babel-jest",
  { presets: ["@wordpress/babel-preset-default"] },
];

module.exports = {
  preset: "@wordpress/jest-preset-default",
  testMatch: ["<rootDir>/tests/js/**/*.test.js"],
  // De nombreuses dépendances des paquets @wordpress (uuid, marked,
  // parsel-js, @wordpress/theme…) ne sont publiées qu'en ESM (.js ou .mjs) :
  // tout node_modules passe par Babel (lent au premier lancement, puis en
  // cache) plutôt qu'une liste à tenir à jour à chaque montée de version.
  transform: { "\\.m?[jt]sx?$": babelTransform },
  transformIgnorePatterns: [],
  // Une seule copie de @wordpress/element : package.json épingle la 6.x
  // alors que @wordpress/blocks embarque la 8.x. Avec deux copies, RawHTML
  // (RichText.Content) n'est pas reconnu par le sérialiseur et le contenu
  // serait enveloppé dans des <div>. WordPress fournit une seule copie en
  // production (externals), ce qui ne concerne donc que les tests.
  moduleNameMapper: {
    ...require("@wordpress/jest-preset-default/jest-preset").moduleNameMapper,
    "^@wordpress/element$": path.dirname(
      require.resolve("@wordpress/element/package.json", {
        paths: [path.dirname(require.resolve("@wordpress/blocks/package.json"))],
      })
    ),
  },
};
