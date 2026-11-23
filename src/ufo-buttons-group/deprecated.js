import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';

// Anciennes sorties de save(), pour que les groupes déjà enregistrés restent
// valides. Ils passent au format actuel (attributs + blocs enfants, rendu par
// render.php) à la prochaine sauvegarde.

// Une entrée deprecated n'hérite ni des attributs ni des supports (ancre) du
// bloc : ils sont déclarés pour chacune.
const attributes = {
	buttonAlignment: {
		type: 'string',
		default: 'left',
	},
};

const JUSTIFY_CLASSES = {
	left: 'justify-start',
	center: 'justify-center',
	right: 'justify-end',
};

const legacySave = ( baseClasses ) =>
	function save( { attributes: { buttonAlignment } } ) {
		const blockProps = useBlockProps.save();
		const justify = JUSTIFY_CLASSES[ buttonAlignment ] ?? 'justify-end';

		return (
			<div { ...blockProps }>
				<div className={ `${ baseClasses } ${ justify }` }>
					<InnerBlocks.Content />
				</div>
			</div>
		);
	};

// Colonne en mobile (alignement via items-*), ligne à partir de lg (via justify-*).
const ALIGNMENT_CLASSES = {
	left: 'items-start lg:justify-start',
	center: 'items-center lg:justify-center',
};

export default [
	// ufo-blocks 1.6.0 → ufo-tools-blocks 1.0.8 : bloc statique.
	{
		attributes,
		supports: metadata.supports,
		save( { attributes: { buttonAlignment } } ) {
			const blockProps = useBlockProps.save();

			const containerClasses = `flex flex-col lg:flex-row lg:flex-nowrap lg:items-stretch p-4 gap-2 ${
				ALIGNMENT_CLASSES[ buttonAlignment ] ??
				'items-end lg:justify-end'
			}`;

			return (
				<div { ...blockProps }>
					<div className={ containerClasses }>
						<InnerBlocks.Content />
					</div>
				</div>
			);
		},
	},
	// 1.5.0 – 1.5.1
	{
		attributes,
		supports: metadata.supports,
		save: legacySave(
			'lg:flex lg:flex-nowrap py-2 gap-2 lg:space-y-0 space-y-2'
		),
	},
	// Avant 1.5.0
	{
		attributes,
		supports: metadata.supports,
		save: legacySave( 'flex flex-nowrap my-0 gap-2' ),
	},
];
