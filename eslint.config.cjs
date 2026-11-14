/**
 * ESLint 9 (wp-scripts lint-js) : configuration plate. Remplace .eslintrc.json,
 * qu'ESLint 9 ne lit plus. Les tests restent sous Jest (wp-scripts
 * test-unit-jest) : leurs règles viennent d'eslint-plugin-jest, pas des
 * règles Vitest que @wordpress/scripts applique par défaut depuis la 36.
 */
const wpPlugin = require( '@wordpress/eslint-plugin' );
const jestPlugin = require( 'eslint-plugin-jest' );
const globals = require( 'globals' );

const jestRecommended = jestPlugin.configs[ 'flat/recommended' ];

module.exports = [
	{ ignores: [ '**/build/**', '**/node_modules/**', '**/vendor/**' ] },
	...wpPlugin.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				requireConfigFile: false,
				babelOptions: {
					presets: [
						require.resolve( '@wordpress/babel-preset-default' ),
					],
				},
			},
		},
		rules: {
			'no-console': 'warn',
			'import/no-extraneous-dependencies': 'off',
			'@wordpress/no-unsafe-wp-apis': 'warn',
		},
	},
	{
		...jestRecommended,
		files: [ 'tests/js/**/*.js' ],
		languageOptions: {
			...jestRecommended.languageOptions,
			globals: {
				...jestRecommended.languageOptions?.globals,
				...globals.browser,
			},
		},
	},
];
