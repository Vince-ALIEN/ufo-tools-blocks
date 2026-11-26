import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import './editor.css';

const TEMPLATE = [
	[
		'core/paragraph',
		{
			className: 'tag',
			placeholder: __( 'Étiquette…', 'ufo-tools-blocks' ),
			content: __( 'Nouveauté', 'ufo-tools-blocks' ),
		},
	],
	[
		'core/heading',
		{
			level: 2,
			placeholder: __( 'Titre de la section…', 'ufo-tools-blocks' ),
			content: __( 'Titre de la section', 'ufo-tools-blocks' ),
		},
	],
];

export default function Edit() {
	const blockProps = useBlockProps( { className: 'heading-group' } );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: 'insert',
	} );

	return <div { ...innerBlocksProps } />;
}
