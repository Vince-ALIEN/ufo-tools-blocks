/**
 * Balisage enregistré par les blocs statiques.
 *
 * Toute modification de save() rend invalides les blocs déjà publiés
 * (« Ce bloc contient un contenu inattendu ») sauf si l'ancienne version est
 * ajoutée à deprecated.js. Les snapshots rendent ce changement visible : s'ils
 * changent, ajouter une entrée deprecated, puis mettre à jour les snapshots
 * (npm run test:unit -- -u).
 */
import {
	registerBlockType,
	unregisterBlockType,
	createBlock,
	getBlockTypes,
	getCategories,
	setCategories,
	getSaveContent,
	serialize,
	parse,
} from '@wordpress/blocks';

import gridMeta from '../../src/ufo-grid/block.json';
import gridSave from '../../src/ufo-grid/save';
import rowMeta from '../../src/ufo-row/block.json';
import rowSave from '../../src/ufo-row/save';
import faqMeta from '../../src/ufo-faq/block.json';
import faqSave from '../../src/ufo-faq/save';
import faqItemMeta from '../../src/ufo-faq-item/block.json';
import faqItemSave from '../../src/ufo-faq-item/save';
import faqItemDeprecated from '../../src/ufo-faq-item/deprecated';
import groupMeta from '../../src/ufo-buttons-group/block.json';
import groupSave from '../../src/ufo-buttons-group/save';
import groupDeprecated from '../../src/ufo-buttons-group/deprecated';
import tabsMeta from '../../src/ufo-tabs/block.json';
import tabMeta from '../../src/ufo-tab/block.json';
import tabSave from '../../src/ufo-tab/save';
import { InnerBlocks } from '@wordpress/block-editor';

const BLOCKS = [
	[ gridMeta, gridSave ],
	[ rowMeta, rowSave ],
	[ faqMeta, faqSave ],
	[ faqItemMeta, faqItemSave, faqItemDeprecated ],
	[ groupMeta, groupSave, groupDeprecated ],
	[ tabsMeta, () => <InnerBlocks.Content /> ],
	[ tabMeta, tabSave ],
];

beforeAll( () => {
	// Catégorie déclarée côté PHP (block_categories_all) dans le plugin.
	setCategories( [
		...getCategories(),
		{ slug: 'ufo-blocks', title: 'UFO Blocks' },
	] );
	BLOCKS.forEach( ( [ metadata, save, deprecated = [] ] ) => {
		const {
			$schema,
			editorScript,
			editorStyle,
			style,
			viewScript,
			render,
			...settings
		} = metadata;
		registerBlockType( metadata.name, {
			...settings,
			edit: () => null,
			save,
			deprecated,
		} );
	} );
} );

afterAll( () => {
	getBlockTypes().forEach( ( { name } ) => unregisterBlockType( name ) );
} );

const saveOf = ( name, attributes = {} ) => {
	const block = createBlock( name, attributes );
	return getSaveContent( block.name, block.attributes, block.innerBlocks );
};

describe( 'save()', () => {
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

	test.each( [ 'left', 'center', 'right' ] )(
		'ufo-buttons-group %s',
		( buttonAlignment ) => {
			expect(
				saveOf( 'ufo-blocks/ufo-buttons-group', { buttonAlignment } )
			).toMatchSnapshot();
		}
	);
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
			const attributes = name.endsWith( 'faq-item' )
				? { question: 'Ancienne question' }
				: {};
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
			const comment =
				Object.keys( block.attributes ).length &&
				! name.endsWith( 'faq-item' )
					? ` ${ JSON.stringify( block.attributes ) }`
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
