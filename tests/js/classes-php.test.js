/**
 * Mêmes classes dans l'éditeur (JS) et sur le site (render.php).
 *
 * L'aperçu de l'éditeur calcule les classes avec src/ufo-grid/shared.js et
 * src/ufo-row/shared.js ; le site, avec leur portage PHP
 * (includes/ufo-tools-blocks-classes.php). Ce test les compare sur toutes les
 * valeurs de l'inspecteur et des combinaisons, en exécutant PHP
 * (tests/php/classes-cli.php).
 */
const { execFileSync } = require( 'child_process' );
const path = require( 'path' );
import { getSaveContent, createBlock } from '@wordpress/blocks';

import { getWrapperClasses, getInnerClasses } from '../../src/ufo-grid/shared';
import { getTailwindClasses } from '../../src/ufo-row/shared';
import { MIN_HEIGHT_OPTIONS } from '../../src/shared/controls';
import gridMeta from '../../src/ufo-grid/block.json';
import rowMeta from '../../src/ufo-row/block.json';
import groupDeprecated from '../../src/ufo-buttons-group/deprecated';
import { registerBlocks, unregisterBlocks } from './support/register-blocks';

const CLI = path.resolve( __dirname, '../php/classes-cli.php' );

const php = ( cases ) =>
	JSON.parse(
		execFileSync( 'php', [ CLI ], {
			input: JSON.stringify( cases ),
			encoding: 'utf8',
		} )
	);

const defaultsOf = ( metadata ) =>
	Object.fromEntries(
		Object.entries( metadata.attributes )
			.filter( ( [ , { default: value } ] ) => value !== undefined )
			.map( ( [ name, { default: value } ] ) => [ name, value ] )
	);

const range = ( from, to, step = 1 ) => {
	const values = [];
	for ( let value = from; value <= to; value += step ) {
		values.push( String( value ) );
	}
	return values;
};

const heights = MIN_HEIGHT_OPTIONS.map( ( { value } ) => value );
const radii = [ '', 'sm', 'md', 'lg', 'xl', '2xl', '3xl' ];
const paddings = range( 0, 16, 2 );
const image = { url: 'https://example.com/a.jpg', id: 1, alt: '' };

// Une valeur à la fois (sur les défauts), puis quelques combinaisons.
const variants = ( defaults, values, combos = [] ) => [
	{},
	defaults,
	...Object.entries( values ).flatMap( ( [ key, list ] ) =>
		list.map( ( value ) => ( { ...defaults, [ key ]: value } ) )
	),
	...combos.map( ( combo ) => ( { ...defaults, ...combo } ) ),
];

const gridCases = variants(
	defaultsOf( gridMeta ),
	{
		columnsCount: [ 1, 2, 3, 4, 5, 6 ],
		breakpoint: [ undefined, '', 'none', 'sm', 'md', 'lg', 'xl', 'autre' ],
		rowsCount: [ 0, 1, 2, 6 ],
		gap: range( 0, 8 ),
		verticalAlignment: [ undefined, '', 'top', 'center', 'bottom' ],
		reverseMobile: [ true, false ],
		equalRows: [ true, false ],
		minHeight: [ ...heights, 'h-full', 'screen', 'full' ],
		borderRadius: radii,
		isBoxed: [ true, false ],
		backgroundImage: [ image, { url: '' } ],
		paddingX: paddings,
		paddingY: paddings,
	},
	[
		{
			columnsCount: 3,
			rowsCount: 2,
			gap: '6',
			verticalAlignment: 'center',
			reverseMobile: true,
			minHeight: 'screen',
			borderRadius: 'xl',
			isBoxed: true,
			backgroundImage: image,
			paddingX: '8',
			paddingY: '4',
		},
		{ minHeight: '64', reverseMobile: true, equalRows: false },
		{
			breakpoint: 'none',
			columnsCount: 2,
			reverseMobile: true,
			equalRows: true,
			minHeight: 'screen',
		},
		{
			breakpoint: 'lg',
			columnsCount: 4,
			reverseMobile: true,
			equalRows: true,
			minHeight: 'screen',
		},
	]
);

const rowCases = variants(
	defaultsOf( rowMeta ),
	{
		colSpan: [ '', ...range( 1, 6 ) ],
		colStart: [ '', ...range( 1, 7 ) ],
		colEnd: [ '', ...range( 1, 8 ) ],
		rowSpan: [ '', ...range( 1, 6 ) ],
		rowStart: [ '', ...range( 1, 7 ) ],
		rowEnd: [ '', ...range( 1, 7 ) ],
		height: [ ...heights, 'screen' ],
		minHeight: [ ...heights, 'full', 'screen' ],
		verticalAlignment: [ '', 'top', 'center', 'bottom' ],
		borderRadius: radii,
		paddingX: paddings,
		paddingY: paddings,
		marginTop: [ '', '-16', '-8', '-2', '2', '8', '16', 'abc' ],
		backgroundImage: [ image, { url: '' } ],
	},
	[
		{
			colSpan: '2',
			colStart: '1',
			colEnd: '3',
			rowSpan: '2',
			rowStart: '1',
			rowEnd: '3',
			height: '64',
			minHeight: 'screen',
			verticalAlignment: 'bottom',
			borderRadius: 'lg',
			paddingX: '4',
			paddingY: '6',
			marginTop: '-8',
			backgroundImage: image,
		},
	]
);

describe( 'classes JS = classes PHP', () => {
	test( 'ufo-grid : enveloppe', () => {
		expect(
			php(
				gridCases.map( ( attributes ) => ( {
					fn: 'ufo_tools_blocks_grid_wrapper_classes',
					attributes,
				} ) )
			)
		).toEqual( gridCases.map( getWrapperClasses ) );
	} );

	test( 'ufo-grid : grille intérieure', () => {
		expect(
			php(
				gridCases.map( ( attributes ) => ( {
					fn: 'ufo_tools_blocks_grid_inner_classes',
					attributes,
				} ) )
			)
		).toEqual( gridCases.map( getInnerClasses ) );
	} );

	test.each( [ undefined, '', 'none', 'sm', 'md', 'lg', 'xl', 'autre' ] )(
		'ufo-row (point de rupture %p)',
		( breakpoint ) => {
			expect(
				php(
					rowCases.map( ( attributes ) => ( {
						fn: 'ufo_tools_blocks_row_classes',
						attributes,
						args: breakpoint === undefined ? [] : [ breakpoint ],
					} ) )
				)
			).toEqual(
				rowCases.map( ( attributes ) =>
					getTailwindClasses( attributes, breakpoint )
				)
			);
		}
	);

	describe( 'ufo-buttons-group (balisage de la 1.0.8)', () => {
		beforeAll( registerBlocks );
		afterAll( unregisterBlocks );

		test( 'alignements', () => {
			const alignments = [ 'left', 'center', 'right', '', 'autre' ];
			const js = alignments.map( ( buttonAlignment ) => {
				const block = createBlock( 'ufo-blocks/ufo-buttons-group', {
					buttonAlignment,
				} );
				const html = getSaveContent(
					{
						name: block.name,
						save: groupDeprecated[ 0 ].save,
						attributes: groupDeprecated[ 0 ].attributes,
					},
					block.attributes
				);
				return html.match( /<div[^>]*><div class="([^"]*)"/ )[ 1 ];
			} );
			expect(
				php(
					alignments.map( ( buttonAlignment ) => ( {
						fn: 'ufo_tools_blocks_buttons_group_classes',
						attributes: { buttonAlignment },
					} ) )
				)
			).toEqual( js );
		} );
	} );
} );
