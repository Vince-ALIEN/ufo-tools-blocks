import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import { getBlockIcon } from '../icons';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: getBlockIcon( 'RectangleEllipsis', {
		background: '#F6F6F7',
		color: '#EB9188',
	} ),
	// Le titre est affiché dans la liste des blocs et le fil d'Ariane.
	__experimentalLabel: ( attributes, { context } ) =>
		context === 'list-view' || context === 'breadcrumb'
			? attributes.title || metadata.title
			: metadata.title,
	edit: Edit,
	save,
} );
