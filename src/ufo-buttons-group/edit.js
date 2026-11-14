import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';

const ALLOWED_BLOCKS = [ 'ufo-blocks/ufo-button' ];

const JUSTIFY_CLASSES = { left: 'justify-start', center: 'justify-center' };

export default function Edit( { attributes, setAttributes } ) {
	const { buttonAlignment } = attributes;

	const blockProps = useBlockProps( { 'data-align': buttonAlignment } );

	const containerClasses = `lg:flex lg:flex-nowrap p-4 gap-2 lg:space-y-0 space-y-2 ${
		JUSTIFY_CLASSES[ buttonAlignment ] ?? 'justify-end'
	}`;

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ alignLeft }
						title={ __( 'Aligner à gauche', 'ufo-tools-blocks' ) }
						isActive={ buttonAlignment === 'left' }
						onClick={ () =>
							setAttributes( { buttonAlignment: 'left' } )
						}
					/>
					<ToolbarButton
						icon={ alignCenter }
						title={ __( 'Centrer', 'ufo-tools-blocks' ) }
						isActive={ buttonAlignment === 'center' }
						onClick={ () =>
							setAttributes( { buttonAlignment: 'center' } )
						}
					/>
					<ToolbarButton
						icon={ alignRight }
						title={ __( 'Aligner à droite', 'ufo-tools-blocks' ) }
						isActive={ buttonAlignment === 'right' }
						onClick={ () =>
							setAttributes( { buttonAlignment: 'right' } )
						}
					/>
				</ToolbarGroup>
			</BlockControls>

			<div { ...blockProps }>
				<div className={ containerClasses }>
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ [ [ 'ufo-blocks/ufo-button' ] ] }
						renderAppender={ () => (
							<InnerBlocks.ButtonBlockAppender />
						) }
					/>
				</div>
			</div>
		</>
	);
}
