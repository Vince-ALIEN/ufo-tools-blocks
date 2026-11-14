/**
 * Prettier : configuration WordPress, la même que celle de wp-scripts lint-js.
 * L'option parenSpacing n'existe que dans wp-prettier, installé ici sous le nom
 * « prettier » : l'éditeur doit utiliser le Prettier du projet, pas le sien.
 *
 * JSON, YAML et Markdown gardent leur indentation actuelle (2 espaces) : ils
 * ne font pas partie du passage au style WordPress.
 */
const wpConfig = require( '@wordpress/prettier-config' );

module.exports = {
	...wpConfig,
	overrides: [
		...( wpConfig.overrides || [] ),
		{
			files: [ '*.json', '*.yml', '*.yaml', '*.md' ],
			options: { useTabs: false, tabWidth: 2, parenSpacing: false },
		},
	],
};
