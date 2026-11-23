/**
 * Exemples des block.json (`example`).
 *
 * Publiés par /wp/v2/block-types et affichés dans l'aperçu de l'inserteur,
 * ils servent de modèle à une IA qui écrit du contenu : chaque exemple doit
 * donc être un contenu valide (attributs déclarés, types et `enum` respectés,
 * blocs enfants autorisés à cet endroit).
 */
const fs = require( 'fs' );
const path = require( 'path' );

const SRC = path.resolve( __dirname, '../../src' );

const blocks = Object.fromEntries(
	fs
		.readdirSync( SRC )
		.filter( ( dir ) =>
			fs.existsSync( path.join( SRC, dir, 'block.json' ) )
		)
		.map( ( dir ) => {
			const metadata = JSON.parse(
				fs.readFileSync( path.join( SRC, dir, 'block.json' ), 'utf8' )
			);
			return [ metadata.name, metadata ];
		} )
);

// Blocs du cœur utilisés dans les exemples, avec les attributs employés.
const CORE = {
	'core/paragraph': { attributes: { content: { type: 'string' } } },
};

const typeOf = ( value ) => {
	if ( Array.isArray( value ) ) {
		return 'array';
	}
	if ( value === null ) {
		return 'null';
	}
	return typeof value === 'number' ? 'number' : typeof value;
};

// Problèmes d'un bloc d'exemple et de ses enfants, à toute profondeur.
const problemsOf = ( name, { attributes = {}, innerBlocks = [] }, parent ) => {
	const metadata = blocks[ name ] ?? CORE[ name ];
	if ( ! metadata ) {
		return [ `${ name } : bloc inconnu` ];
	}

	const problems = [];
	const schema = metadata.attributes ?? {};

	Object.entries( attributes ).forEach( ( [ key, value ] ) => {
		const definition = schema[ key ];
		if ( ! definition ) {
			problems.push( `${ name }.${ key } : attribut non déclaré` );
			return;
		}
		if ( definition.type && typeOf( value ) !== definition.type ) {
			problems.push(
				`${ name }.${ key } : ${ typeOf( value ) } au lieu de ${
					definition.type
				}`
			);
		}
		if ( definition.enum && ! definition.enum.includes( value ) ) {
			problems.push( `${ name }.${ key } : ${ value } hors enum` );
		}
	} );

	if ( metadata.parent && ! metadata.parent.includes( parent ) ) {
		problems.push(
			`${ name } : doit être dans ${ metadata.parent.join( ' ou ' ) }`
		);
	}

	innerBlocks.forEach( ( child ) => {
		if (
			metadata.allowedBlocks &&
			! metadata.allowedBlocks.includes( child.name )
		) {
			problems.push( `${ child.name } : non autorisé dans ${ name }` );
		}
		problems.push( ...problemsOf( child.name, child, name ) );
	} );

	return problems;
};

describe( 'example des block.json', () => {
	test( 'les 10 blocs sont présents', () => {
		expect( Object.keys( blocks ) ).toHaveLength( 10 );
	} );

	test.each( Object.keys( blocks ) )( '%s a un exemple', ( name ) => {
		expect( blocks[ name ].example ).toEqual( expect.any( Object ) );
	} );

	test.each( Object.keys( blocks ) )( '%s : exemple valide', ( name ) => {
		const { example, parent } = blocks[ name ];
		// Un bloc enfant est vérifié comme s'il était dans son parent.
		expect( problemsOf( name, example, parent?.[ 0 ] ) ).toEqual( [] );
	} );

	test.each( Object.keys( blocks ) )(
		'%s : description rédigée pour un usage',
		( name ) => {
			expect( blocks[ name ].description.length ).toBeGreaterThan( 60 );
		}
	);
} );
