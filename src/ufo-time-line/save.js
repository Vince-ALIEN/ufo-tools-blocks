import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Rendu serveur (render.php) : seuls les blocs enfants sont enregistrés. Le
 * format statique de ufo-blocks est dans deprecated.js.
 */
export default function save() {
	return <InnerBlocks.Content />;
}
