import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import metadata from './block.json';

/**
 * Ancien format enregistré, pour que les onglets existants restent valides.
 * Ils passent au format actuel (attributs + blocs enfants, rendu par
 * render.php) à la prochaine sauvegarde.
 */

// Une entrée deprecated n'hérite ni des attributs ni des supports du bloc :
// les attributs n'ont pas changé depuis la 1.0.8. Si block.json les modifie,
// figer ici ceux de la 1.0.8.

// 1.0.5 – 1.0.8 : bloc statique, enveloppe <div> dans le HTML enregistré.
const v1 = {
	attributes: metadata.attributes,
	supports: metadata.supports,
	save() {
		return <div { ...useInnerBlocksProps.save( useBlockProps.save() ) } />;
	},
};

export default [ v1 ];
