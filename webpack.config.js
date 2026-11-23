const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );

const defaultEntryPoints = defaultConfig.entry();

module.exports = {
	...defaultConfig,
	entry: {
		...defaultEntryPoints,
	},
	plugins: [
		...defaultConfig.plugins,
		// Guide pour les assistants IA, servi par GET ufo-tools-blocks/v1/guide :
		// build/ est dans le zip de release, docs/ non.
		new CopyPlugin( {
			patterns: [
				{ from: 'docs/blocs-pour-ia.md', to: 'blocs-pour-ia.md' },
			],
		} ),
	],
	optimization: {
		...defaultConfig.optimization,
		minimizer: [
			new TerserPlugin( {
				terserOptions: {
					compress: {
						drop_console: true,
						drop_debugger: true,
						pure_funcs: [
							'console.info',
							'console.debug',
							'console.warn',
						],
					},
					mangle: {
						reserved: [ 'wp', 'jQuery', '$', 'React', 'ReactDOM' ],
					},
					format: {
						comments: false,
					},
				},
				extractComments: false,
				parallel: true,
			} ),
		],
	},
};
