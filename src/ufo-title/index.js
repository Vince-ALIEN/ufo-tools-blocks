import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { getBlockIcon } from '../icons';

registerBlockType( metadata.name, {
	icon: getBlockIcon( 'Heading', {
		background: '#F6F6F7',
		color: '#EB9188',
	} ),
	edit: Edit,
	save,
	supports: {
		...metadata.supports,
		color: {
			background: false,
			text: true,
		},
	},
} );
