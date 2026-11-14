const path = require("path");
const defaultConfig = require("@wordpress/scripts/config/jest-unit.config");

const babelTransform = path.join(
  path.dirname(require.resolve("@wordpress/scripts/package.json")),
  "config/babel-transform"
);

module.exports = {
  ...defaultConfig,
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
    ...defaultConfig.moduleNameMapper,
    "^@wordpress/element$": path.dirname(
      require.resolve("@wordpress/element/package.json", {
        paths: [path.dirname(require.resolve("@wordpress/blocks/package.json"))],
      })
    ),
  },
};
