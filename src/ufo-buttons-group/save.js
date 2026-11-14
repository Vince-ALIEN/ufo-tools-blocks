import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

// Colonne en mobile (alignement via items-*), ligne à partir de lg (via justify-*).
const ALIGNMENT_CLASSES = {
	left: 'items-start lg:justify-start',
	center: 'items-center lg:justify-center',
};

export default function save( { attributes } ) {
	const { buttonAlignment } = attributes;

	const blockProps = useBlockProps.save();

	const containerClasses = `flex flex-col lg:flex-row lg:flex-nowrap lg:items-stretch p-4 gap-2 ${
		ALIGNMENT_CLASSES[ buttonAlignment ] ?? 'items-end lg:justify-end'
	}`;

	return (
		<div { ...blockProps }>
			<div className={ containerClasses }>
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
