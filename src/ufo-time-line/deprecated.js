import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import metadata from './block.json';

/**
 * Format enregistré par le plugin ufo-blocks (bloc statique), pour que les
 * frises existantes restent valides. Elles passent au format actuel (blocs
 * enfants seulement, rendu par render.php) à la prochaine sauvegarde.
 *
 * Copie figée du save() de ufo-blocks : ne pas modifier.
 */
const v1 = {
	supports: metadata.supports,
	save() {
		const blockProps = useBlockProps.save();
		const innerBlocksProps = useInnerBlocksProps.save( {
			className:
				'relative border-l-3 border-secondary ml-3 lg:my-3 my-1 px-2',
		} );

		return (
			<div { ...blockProps }>
				<ol { ...innerBlocksProps } />
			</div>
		);
	},
};

export default [ v1 ];
