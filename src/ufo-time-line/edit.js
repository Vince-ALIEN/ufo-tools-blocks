import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import './editor.css';

const TEMPLATE = [
	[ 'ufo-blocks/ufo-time-line-item' ],
	[ 'ufo-blocks/ufo-time-line-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'ufo-time-line-container',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className:
				'relative border-l-3 border-secondary ml-3 lg:my-3 my-1 px-2',
		},
		{
			allowedBlocks: [ 'ufo-blocks/ufo-time-line-item' ],
			template: TEMPLATE,
			templateLock: false,
		}
	);

	return (
		<div { ...blockProps }>
			<ol { ...innerBlocksProps } />
		</div>
	);
}
