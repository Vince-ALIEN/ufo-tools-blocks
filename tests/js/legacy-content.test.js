/**
 * Contenus enregistrés avec la 1.0.8 et avant (tests/fixtures/*.html, produits
 * par les save() de l'époque) : ouverts avec la version actuelle, ils doivent
 * être valides, migrés vers le format rendu par le serveur sans rien perdre
 * (questions de FAQ, ancres, réglages), puis stables.
 *
 * Les mêmes fixtures servent au contrôle du rendu front
 * (scripts/check-rendering.php). Leur version migrée (ce que l'éditeur
 * enregistre) est dans tests/fixtures/migrated/ : le rendu PHP de celle-ci doit
 * être identique au rendu de l'original. Après un changement voulu, les
 * régénérer avec UPDATE_FIXTURES=1 npm run test:unit.
 */
const fs = require( 'fs' );
const path = require( 'path' );
import { parse, serialize } from '@wordpress/blocks';
import { registerBlocks, unregisterBlocks } from './support/register-blocks';

const FIXTURES = path.resolve( __dirname, '../fixtures' );
const fixtures = fs
	.readdirSync( FIXTURES )
	.filter( ( file ) => file.endsWith( '.html' ) );

const read = ( file ) => fs.readFileSync( path.join( FIXTURES, file ), 'utf8' );

const flatten = ( blocks ) =>
	blocks.flatMap( ( block ) => [ block, ...flatten( block.innerBlocks ) ] );

const ufoBlocks = ( blocks ) =>
	flatten( blocks ).filter( ( { name } ) =>
		name.startsWith( 'ufo-blocks/' )
	);

beforeAll( registerBlocks );
afterAll( unregisterBlocks );

describe( 'contenus enregistrés en 1.0.8 et avant', () => {
	test( 'des fixtures sont présentes', () => {
		expect( fixtures.length ).toBeGreaterThanOrEqual( 7 );
	} );

	test.each( fixtures )( '%s : tous les blocs sont valides', ( file ) => {
		const blocks = flatten( parse( read( file ) ) );
		expect(
			blocks
				.filter( ( { isValid } ) => ! isValid )
				.map( ( { name } ) => name )
		).toEqual( [] );
		// Migrations « Block successfully updated » attendues.
		expect( console ).toHaveInformed();
	} );

	test.each( fixtures )(
		'%s : enregistré à nouveau, aucun HTML d’enveloppe ufo ne reste',
		( file ) => {
			const html = serialize( parse( read( file ) ) );
			expect( html ).not.toMatch( /wp-block-ufo-blocks-/ );
			expect( html ).not.toMatch( /application\/ld\+json/ );
			expect( html ).not.toMatch( /<details|<summary|<svg/ );
			expect( console ).toHaveInformed();
		}
	);

	test.each( fixtures )(
		'%s : version migrée à jour dans tests/fixtures/migrated/',
		( file ) => {
			const migrated = serialize( parse( read( file ) ) ) + '\n';
			expect( console ).toHaveInformed();
			const target = path.join( FIXTURES, 'migrated', file );
			if ( process.env.UPDATE_FIXTURES ) {
				fs.mkdirSync( path.dirname( target ), { recursive: true } );
				fs.writeFileSync( target, migrated );
			}
			expect( fs.readFileSync( target, 'utf8' ) ).toBe( migrated );
		}
	);

	test.each( fixtures )(
		'%s : le nouveau format est stable (relu sans migration)',
		( file ) => {
			const migrated = serialize( parse( read( file ) ) );
			expect( console ).toHaveInformed();
			const reparsed = parse( migrated );
			expect(
				flatten( reparsed ).every( ( { isValid } ) => isValid )
			).toBe( true );
			expect( serialize( reparsed ) ).toBe( migrated );
		}
	);

	test( 'questions de FAQ conservées (y compris HTML et anciens formats)', () => {
		const questions = [ 'faq.html', 'legacy.html' ].flatMap( ( file ) =>
			ufoBlocks( parse( read( file ) ) )
				.filter( ( { name } ) => name === 'ufo-blocks/ufo-faq-item' )
				.map( ( { attributes } ) => String( attributes.question ) )
		);
		expect( console ).toHaveInformed();
		expect( questions ).toEqual( [
			'Combien <strong>ça</strong> coûte &amp; quand ?',
			'Deuxième question',
			'Sans schema',
			'Schema sans nom',
			'Ancienne bordure grise',
			'Ancienne couleur violette',
		] );
	} );

	test( 'ancres conservées, y compris celles présentes seulement dans le HTML', () => {
		const anchors = fixtures.flatMap( ( file ) =>
			ufoBlocks( parse( read( file ) ) )
				.filter( ( { attributes } ) => attributes.anchor )
				.map( ( { name, attributes } ) => [
					name.replace( 'ufo-blocks/', '' ),
					attributes.anchor,
				] )
		);
		expect( console ).toHaveInformed();
		expect( anchors ).toEqual(
			expect.arrayContaining( [
				[ 'ufo-buttons-group', 'actions' ],
				[ 'ufo-buttons-group', 'ancre-html' ],
				[ 'ufo-row', 'ligne-html' ],
				[ 'ufo-faq', 'faq' ],
				[ 'ufo-grid', 'services' ],
				[ 'ufo-row', 'cellule' ],
				[ 'ufo-tabs', 'onglets' ],
				[ 'ufo-time-line', 'parcours' ],
				[ 'ufo-heading-group', 'calendrier' ],
			] )
		);
		expect( anchors ).toHaveLength( 9 );
	} );

	test( 'réglages de ufo-heading-group conservés (supports)', () => {
		const [ , group ] = parse( read( 'heading-group.html' ) ).filter(
			( { name } ) => name === 'ufo-blocks/ufo-heading-group'
		);
		expect( console ).toHaveInformed();
		expect( group.attributes ).toMatchObject( {
			align: 'wide',
			textColor: 'primary',
			backgroundColor: 'secondary-10',
			style: { spacing: { padding: { top: '2rem', bottom: '2rem' } } },
		} );
		expect( group.innerBlocks.map( ( { name } ) => name ) ).toEqual( [
			'core/paragraph',
			'core/heading',
		] );
	} );

	test( 'étapes de frise conservées (ufo-blocks) : date, titre, réglages', () => {
		const items = ufoBlocks( parse( read( 'time-line.html' ) ) )
			.filter( ( { name } ) => name === 'ufo-blocks/ufo-time-line-item' )
			.map( ( { attributes } ) => ( {
				...attributes,
				date: String( attributes.date ),
				title: String( attributes.title ),
			} ) );
		expect( console ).toHaveInformed();
		expect( items ).toEqual( [
			{
				icon: 'Leaf',
				date: 'Septembre – Octobre',
				title: 'Premier rendez-vous',
				textColor: 'success',
				customTextColor: '#639560',
				markerColor: 'success',
				customMarkerColor: '#639560',
				className: 'ml-6',
			},
			expect.objectContaining( {
				icon: 'Search',
				date: 'Novembre',
				markerColor: 'secondary-10',
			} ),
			expect.objectContaining( {
				icon: 'Target',
				title: 'Mise en <em>ligne</em>',
			} ),
			{ icon: '', date: 'Ensuite', title: 'Sans réglage' },
		] );
	} );

	test( 'réglages de la grille conservés', () => {
		const [ grid ] = parse( read( 'grid-full.html' ) );
		expect( console ).toHaveInformed();
		expect( grid.attributes ).toMatchObject( {
			columnsCount: 3,
			gap: '6',
			reverseMobile: true,
			backgroundVideo: { url: 'https://example.com/a.mp4' },
			backgroundColor: 'primary',
			className: 'ma-grille',
			align: 'full',
			style: { border: { width: '2px' } },
		} );
		expect( grid.innerBlocks[ 0 ].attributes ).toMatchObject( {
			colSpan: '2',
			backgroundImage: { url: 'https://example.com/b.jpg' },
		} );
	} );
} );
