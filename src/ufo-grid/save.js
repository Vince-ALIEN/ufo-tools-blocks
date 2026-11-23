import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Rendu serveur (render.php) depuis la 1.1.0 : seuls les attributs (dans le
 * commentaire du bloc) et les blocs enfants sont enregistrés, donc aucun HTML
 * à reproduire au caractère près. Les formats enregistrés auparavant sont dans
 * deprecated.js.
 */
export default function save() {
	return <InnerBlocks.Content />;
}
