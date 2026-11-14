/**
 * Le plugin ne livre pas de CSS : le thème compile Tailwind en scannant src/
 * (@source) et en ajoutant la safelist du README (@source inline). Une classe
 * construite par template literal (`md:grid-cols-${n}`) n'apparaît dans aucun
 * fichier : elle doit être dans la safelist, sinon elle est absente du CSS du
 * site. Ce test génère toutes les classes que les réglages de l'inspecteur
 * peuvent produire et vérifie que chacune est détectable par le thème.
 */
const fs = require( 'fs' );
const path = require( 'path' );

import { getWrapperClasses, getInnerClasses } from '../../src/ufo-grid/shared';
import { getTailwindClasses } from '../../src/ufo-row/shared';
import { MIN_HEIGHT_OPTIONS } from '../../src/shared/controls';

const ROOT = path.resolve( __dirname, '../..' );

const range = ( from, to, step = 1 ) => {
	const values = [];
	for ( let value = from; value <= to; value += step ) {
		values.push( String( value ) );
	}
	return values;
};

// Expansion des accolades de `@source inline("md:col-span-{1,2,3}")`.
const expand = ( pattern ) => {
	const match = pattern.match( /\{([^}]*)\}/ );
	if ( ! match ) {
		return [ pattern ];
	}
	return match[ 1 ]
		.split( ',' )
		.flatMap( ( part ) =>
			expand( pattern.replace( match[ 0 ], part.trim() ) )
		);
};

const readme = fs.readFileSync( path.join( ROOT, 'README.md' ), 'utf8' );
const safelist = new Set(
	[ ...readme.matchAll( /@source inline\("([^"]+)"\)/g ) ].flatMap( ( m ) =>
		expand( m[ 1 ] )
	)
);

// Ce que le scanner Tailwind trouve tel quel dans les sources.
const listFiles = ( dir ) =>
	fs.readdirSync( dir, { withFileTypes: true } ).flatMap( ( entry ) => {
		const full = path.join( dir, entry.name );
		if ( entry.isDirectory() ) {
			return listFiles( full );
		}
		return /\.(js|php)$/.test( entry.name ) ? [ full ] : [];
	} );
const scanned = new Set(
	listFiles( path.join( ROOT, 'src' ) )
		.map( ( file ) => fs.readFileSync( file, 'utf8' ) )
		.join( '\n' )
		.split( /[^\w:\-/.[\]%]+/ )
);

const isDetectable = ( className ) =>
	safelist.has( className ) || scanned.has( className );

const classesOf = ( ...outputs ) =>
	outputs.join( ' ' ).split( /\s+/ ).filter( Boolean );

const heights = MIN_HEIGHT_OPTIONS.map( ( { value } ) => value ).filter(
	Boolean
);
const radii = [ 'sm', 'md', 'lg', 'xl', '2xl', '3xl' ];
const paddings = range( 0, 16, 2 );

describe( 'safelist Tailwind du README', () => {
	test( "ufo-grid : toutes les valeurs de l'inspecteur", () => {
		const generated = [];
		range( 1, 6 ).forEach( ( columnsCount ) =>
			generated.push(
				...classesOf(
					getInnerClasses( { columnsCount: Number( columnsCount ) } )
				)
			)
		);
		range( 0, 8 ).forEach( ( gap ) =>
			generated.push( ...classesOf( getInnerClasses( { gap } ) ) )
		);
		range( 1, 6 ).forEach( ( rowsCount ) =>
			generated.push(
				...classesOf(
					getInnerClasses( { rowsCount: Number( rowsCount ) } )
				)
			)
		);
		[ ...heights, 'h-full', 'screen' ].forEach( ( minHeight ) =>
			generated.push(
				...classesOf(
					getWrapperClasses( { minHeight } ),
					getInnerClasses( { minHeight } )
				)
			)
		);
		radii.forEach( ( borderRadius ) =>
			generated.push(
				...classesOf( getWrapperClasses( { borderRadius } ) )
			)
		);
		paddings.forEach( ( padding ) =>
			generated.push(
				...classesOf(
					getWrapperClasses( {
						paddingX: padding,
						paddingY: padding,
					} )
				)
			)
		);

		expect(
			generated.filter( ( className ) => ! isDetectable( className ) )
		).toEqual( [] );
	} );

	test( "ufo-row : toutes les valeurs de l'inspecteur", () => {
		const generated = [];
		const placements = {
			colSpan: range( 1, 6 ),
			colStart: range( 1, 7 ),
			colEnd: range( 1, 8 ),
			rowSpan: range( 1, 6 ),
			rowStart: range( 1, 7 ),
			rowEnd: range( 1, 7 ),
			height: [ ...heights, 'screen' ],
			minHeight: [ ...heights, 'full', 'screen' ],
			borderRadius: radii,
			paddingX: paddings.filter( ( value ) => value !== '0' ),
			paddingY: paddings.filter( ( value ) => value !== '0' ),
			verticalAlignment: [ 'top', 'center', 'bottom' ],
		};
		Object.entries( placements ).forEach( ( [ key, values ] ) =>
			values.forEach( ( value ) =>
				generated.push(
					...classesOf( getTailwindClasses( { [ key ]: value } ) )
				)
			)
		);

		expect(
			generated.filter( ( className ) => ! isDetectable( className ) )
		).toEqual( [] );
	} );
} );
