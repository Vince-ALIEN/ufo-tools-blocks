import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import Edit from './edit';
import { getBlockIcon } from '../icons';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: getBlockIcon( 'AppWindowMac', {
		background: '#F6F6F7',
		color: '#EB9188',
	} ),
	edit: Edit,
	// Bloc dynamique (render.php) : seuls les onglets enfants sont enregistrés.
	save: () => <InnerBlocks.Content />,
} );
