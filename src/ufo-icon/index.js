import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { getBlockIcon } from '../icons';

registerBlockType( metadata.name, {
	icon: getBlockIcon( 'LucideLogo', {
		background: '#F6F6F7',
		color: '#EB9188',
	} ),
	edit: Edit,
	save,
} );
