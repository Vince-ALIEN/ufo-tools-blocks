/**
 * Balisage enregistré par les blocs.
 *
 * Depuis la 1.1.0, tous les blocs sont rendus par le serveur : le contenu
 * enregistré se limite au commentaire (attributs) et aux blocs enfants
 * (« format actuel »). Le balisage statique de la 1.0.8 reste reconnu grâce à
 * deprecated.js : ses snapshots ne doivent jamais changer, sans quoi les
 * contenus publiés deviendraient « inattendus ou non valides » dans
 * l'éditeur.
 */
import {
	createBlock,
	getSaveContent,
	serialize,
	parse,
} from '@wordpress/blocks';
import {
	BLOCKS,
	registerBlocks,
	unregisterBlocks,
} from './support/register-blocks';

beforeAll( registerBlocks );
afterAll( unregisterBlocks );

const DEPRECATED = Object.fromEntries(
	BLOCKS.map( ( [ metadata, , deprecated = [] ] ) => [
		metadata.name,
		deprecated,
	] )
);
const saveOf = ( name, attributes = {} ) => {
	const block = createBlock( name, attributes );
	const [ legacy ] = DEPRECATED[ name ];
	return getSaveContent(
		{ name, save: legacy.save, attributes: legacy.attributes },
		block.attributes,
		block.innerBlocks
	);
};

describe( 'balisage 1.0.8 (deprecated[0], figé)', () => {
	test( 'ufo-grid par défaut', () => {
		expect( saveOf( 'ufo-blocks/ufo-grid' ) ).toMatchSnapshot();
	} );

	test( 'ufo-grid avec tous les réglages', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-grid', {
				columnsCount: 3,
				rowsCount: 2,
				gap: '6',
				verticalAlignment: 'center',
				reverseMobile: true,
				minHeight: 'screen',
				borderRadius: 'xl',
				isBoxed: true,
				paddingX: '8',
				paddingY: '4',
				backgroundImage: { url: 'https://example.com/a.jpg', id: 1 },
				backgroundVideo: { url: 'https://example.com/a.mp4', id: 2 },
			} )
		).toMatchSnapshot();
	} );

	test( 'ufo-row avec placement', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-row', {
				colSpan: '2',
				colStart: '1',
				rowSpan: '2',
				height: '64',
				verticalAlignment: 'bottom',
				borderRadius: 'lg',
				paddingX: '4',
				backgroundImage: { url: 'https://example.com/b.jpg', id: 3 },
			} )
		).toMatchSnapshot();
	} );

	test( 'ufo-faq avec schema', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-faq', {
				schemaName: 'FAQ',
				schemaAbout: 'Tarifs',
			} )
		).toMatchSnapshot();
	} );

	test( 'ufo-faq-item', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-faq-item', {
				question: 'Combien ça coûte ?',
			} )
		).toMatchSnapshot();
	} );

	test( 'ufo-tab', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-tab', { title: 'Tarifs' } )
		).toMatchSnapshot();
	} );

	test( 'ufo-time-line (ufo-blocks)', () => {
		expect( saveOf( 'ufo-blocks/ufo-time-line' ) ).toMatchSnapshot();
	} );

	test( 'ufo-time-line-item (ufo-blocks), sans réglage', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-time-line-item', {
				date: '2026',
				title: 'Étape',
			} )
		).toMatchSnapshot();
	} );

	test( 'ufo-time-line-item (ufo-blocks), icône et couleurs', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-time-line-item', {
				icon: 'Target',
				date: '3<sup>e</sup>',
				title: 'Choix <em>final</em>',
				textColor: 'primary',
				customTextColor: '#D73904',
				markerColor: 'secondary',
				customMarkerColor: '#048481',
			} )
		).toMatchSnapshot();
	} );

	test( 'ufo-time-line-item (ufo-blocks), icône chiffre', () => {
		expect(
			saveOf( 'ufo-blocks/ufo-time-line-item', {
				icon: 'Digit1',
				date: 'Étape 1',
				title: 'Inscription',
				markerColor: 'primary',
				customMarkerColor: '#D73904',
			} )
		).toMatchSnapshot();
	} );

	test.each( [ 'left', 'center', 'right' ] )(
		'ufo-buttons-group %s',
		( buttonAlignment ) => {
			expect(
				saveOf( 'ufo-blocks/ufo-buttons-group', { buttonAlignment } )
			).toMatchSnapshot();
		}
	);
} );

describe( 'format actuel : attributs et blocs enfants seulement', () => {
	const paragraph = () =>
		createBlock( 'core/paragraph', { content: 'Contenu' } );

	test.each( [
		[ 'ufo-blocks/ufo-grid', { columnsCount: 3, gap: '6' }, 'ufo-row' ],
		[ 'ufo-blocks/ufo-row', { colSpan: '2', paddingX: '4' }, null ],
		[ 'ufo-blocks/ufo-buttons-group', { buttonAlignment: 'center' }, null ],
		[ 'ufo-blocks/ufo-faq', { schemaName: 'FAQ' }, 'ufo-faq-item' ],
		[
			'ufo-blocks/ufo-faq-item',
			{ question: 'Combien <em>ça</em> coûte ?' },
			null,
		],
		[ 'ufo-blocks/ufo-tab', { title: 'Tarifs' }, null ],
		[ 'ufo-blocks/ufo-time-line', {}, 'ufo-time-line-item' ],
		[
			'ufo-blocks/ufo-time-line-item',
			{
				icon: 'Target',
				date: 'Mars',
				title: 'Choix <em>final</em>',
				markerColor: 'primary',
				customMarkerColor: '#D73904',
			},
			null,
		],
	] )( '%s', ( name, attributes, child ) => {
		const inner = child
			? [ createBlock( `ufo-blocks/${ child }`, {}, [ paragraph() ] ) ]
			: [ paragraph() ];
		const html = serialize( [ createBlock( name, attributes, inner ) ] );
		expect( html ).not.toMatch( /<(div|details|script)/ );
		expect( html ).toMatchSnapshot();
	} );
} );

describe( 'contenu existant', () => {
	test.each( BLOCKS.map( ( [ metadata ] ) => metadata.name ) )(
		'%s : un bloc enregistré puis relu reste valide',
		( name ) => {
			const [ parsed ] = parse( serialize( createBlock( name ) ) );
			expect( parsed.isValid ).toBe( true );
		}
	);

	// Pour chaque version dépréciée : un bloc enregistré avec l'ancien save()
	// doit être reconnu et migré, pas signalé comme invalide.
	const deprecatedCases = BLOCKS.flatMap(
		( [ metadata, , deprecated = [] ] ) =>
			deprecated.map( ( version, index ) => [
				metadata.name,
				index,
				version,
			] )
	);

	test.each( deprecatedCases )(
		'%s : deprecated[%i] est migré',
		( name, index, version ) => {
			const attributes = {
				'ufo-blocks/ufo-faq-item': { question: 'Ancienne question' },
				'ufo-blocks/ufo-time-line-item': {
					icon: 'Target',
					date: 'Mars',
					title: 'Ancienne étape',
					markerColor: 'primary',
					customMarkerColor: '#D73904',
				},
			}[ name ];
			const block = createBlock( name, attributes );
			const html = getSaveContent(
				{
					...block,
					name,
					save: version.save,
					attributes: version.attributes,
				},
				block.attributes
			);
			// Attributs du commentaire : ceux que l'ancien format ne lisait
			// pas dans le HTML (source).
			const commentAttributes = Object.fromEntries(
				Object.entries( block.attributes ).filter(
					( [ key ] ) => ! version.attributes?.[ key ]?.source
				)
			);
			const comment = Object.keys( commentAttributes ).length
				? ` ${ JSON.stringify( commentAttributes ) }`
				: '';
			const [ parsed ] = parse(
				`<!-- wp:${ name }${ comment } -->\n${ html }\n<!-- /wp:${ name } -->`
			);

			expect( parsed.isValid ).toBe( true );
			// « Block successfully updated » : la migration a bien eu lieu.
			expect( console ).toHaveInformed();
		}
	);
} );
