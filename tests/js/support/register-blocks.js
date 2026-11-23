/**
 * Enregistre les blocs du plugin (save et deprecated réels, edit vide) et des
 * équivalents minimaux de core/paragraph et core/list, pour parser et
 * sérialiser du contenu dans les tests.
 */
import {
	registerBlockType,
	unregisterBlockType,
	getBlockTypes,
	getCategories,
	setCategories,
} from '@wordpress/blocks';
import { InnerBlocks, RichText } from '@wordpress/block-editor';

import gridMeta from '../../../src/ufo-grid/block.json';
import gridSave from '../../../src/ufo-grid/save';
import gridDeprecated from '../../../src/ufo-grid/deprecated';
import rowMeta from '../../../src/ufo-row/block.json';
import rowSave from '../../../src/ufo-row/save';
import rowDeprecated from '../../../src/ufo-row/deprecated';
import faqMeta from '../../../src/ufo-faq/block.json';
import faqSave from '../../../src/ufo-faq/save';
import faqDeprecated from '../../../src/ufo-faq/deprecated';
import faqItemMeta from '../../../src/ufo-faq-item/block.json';
import faqItemSave from '../../../src/ufo-faq-item/save';
import faqItemDeprecated from '../../../src/ufo-faq-item/deprecated';
import groupMeta from '../../../src/ufo-buttons-group/block.json';
import groupSave from '../../../src/ufo-buttons-group/save';
import groupDeprecated from '../../../src/ufo-buttons-group/deprecated';
import tabsMeta from '../../../src/ufo-tabs/block.json';
import tabMeta from '../../../src/ufo-tab/block.json';
import tabSave from '../../../src/ufo-tab/save';
import tabDeprecated from '../../../src/ufo-tab/deprecated';
import buttonMeta from '../../../src/ufo-button/block.json';

export const BLOCKS = [
	[ gridMeta, gridSave, gridDeprecated ],
	[ rowMeta, rowSave, rowDeprecated ],
	[ faqMeta, faqSave, faqDeprecated ],
	[ faqItemMeta, faqItemSave, faqItemDeprecated ],
	[ groupMeta, groupSave, groupDeprecated ],
	[ tabsMeta, () => <InnerBlocks.Content /> ],
	[ tabMeta, tabSave, tabDeprecated ],
	[ buttonMeta, () => null ],
];

const text = ( tagName ) => ( {
	apiVersion: 3,
	category: 'text',
	title: tagName,
	attributes: {
		content: { type: 'string', source: 'html', selector: tagName },
	},
	edit: () => null,
	save: ( { attributes } ) => (
		<RichText.Content tagName={ tagName } value={ attributes.content } />
	),
} );

export function registerBlocks() {
	// Catégorie déclarée côté PHP (block_categories_all) dans le plugin.
	setCategories( [
		...getCategories(),
		{ slug: 'ufo-blocks', title: 'UFO Blocks' },
	] );
	registerBlockType( 'core/paragraph', text( 'p' ) );
	registerBlockType( 'core/list-item', text( 'li' ) );
	registerBlockType( 'core/list', {
		apiVersion: 3,
		category: 'text',
		title: 'list',
		edit: () => null,
		save: () => (
			<ul className="wp-block-list">
				<InnerBlocks.Content />
			</ul>
		),
	} );
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
}

export function unregisterBlocks() {
	getBlockTypes().forEach( ( { name } ) => unregisterBlockType( name ) );
}
