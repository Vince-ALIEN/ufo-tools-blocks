import { registerBlockType } from '@wordpress/blocks';
import './style.css';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import variations from './variations';
import transforms from './transforms';
import { getBlockIcon } from '../icons';
import metadata from './block.json';

/**
 * Enregistrement du bloc Grid
 */
registerBlockType( metadata.name, {
	icon: getBlockIcon( 'LayoutDashboard', {
		background: '#F6F6F7',
		color: '#EB9188',
	} ),
	edit: Edit,
	save,
	deprecated,
	variations,
	transforms,
} );
