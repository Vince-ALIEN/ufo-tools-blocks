import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import metadata from './block.json';

/**
 * Format enregistré par le plugin ufo-blocks (bloc statique), pour que les
 * groupes existants restent valides. Ils passent au format actuel (blocs
 * enfants seulement, rendu par render.php) à la prochaine sauvegarde.
 *
 * Copie figée du save() de ufo-blocks : ne pas modifier. Le bloc n'avait pas
 * d'attribut propre ; ses réglages (couleurs, marges, alignement, ancre)
 * viennent des supports.
 */
const v1 = {
	attributes: {},
	supports: metadata.supports,
	save() {
		const blockProps = useBlockProps.save( { className: 'heading-group' } );
		const innerBlocksProps = useInnerBlocksProps.save( blockProps );

		return <div { ...innerBlocksProps } />;
	},
};

export default [ v1 ];
