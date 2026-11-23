import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import metadata from './block.json';

/**
 * Anciens formats enregistrés, pour que les FAQ existantes restent valides.
 * Elles passent au format actuel (attributs + blocs enfants, rendu et schema
 * JSON-LD par render.php) à la prochaine sauvegarde.
 */

// Une entrée deprecated n'hérite ni des attributs ni des supports du bloc :
// les attributs n'ont pas changé depuis la 1.0.8. Si block.json les modifie,
// figer ici ceux de la 1.0.8.

// ≤ 1.0.8 : bloc statique, avec un schema FAQPage partiel (sans mainEntity)
// que le filtre PHP de l'époque remplaçait par le schema complet.
const v1 = {
	attributes: metadata.attributes,
	supports: metadata.supports,
	save( { attributes } ) {
		const {
			enableSchema = true,
			schemaName = '',
			schemaDescription = '',
			schemaAbout = '',
		} = attributes;

		const blockProps = useBlockProps.save();
		const innerBlocksProps = useInnerBlocksProps.save( {
			className: 'w-full space-y-3 lg:my-3 my-1 px-2',
		} );

		const hasSchema =
			enableSchema &&
			( schemaName.trim() ||
				schemaDescription.trim() ||
				schemaAbout.trim() );

		const jsonLd = hasSchema
			? {
					'@context': 'https://schema.org',
					'@type': 'FAQPage',
					...( schemaName.trim() && { name: schemaName } ),
					...( schemaDescription.trim() && {
						description: schemaDescription,
					} ),
					...( schemaAbout.trim() && { about: schemaAbout } ),
				}
			: null;

		return (
			<>
				{ jsonLd && (
					<script type="application/ld+json">
						{ JSON.stringify( jsonLd ) }
					</script>
				) }
				<div { ...blockProps }>
					<div { ...innerBlocksProps } />
				</div>
			</>
		);
	},
};

export default [ v1 ];
