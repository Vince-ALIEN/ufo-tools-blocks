/**
 * Réglage « Marge haute » de core/image (même curseur que ufo-row).
 *
 * L'attribut ufoMarginTop est seulement enregistré dans le commentaire du
 * bloc : la classe (mt-N, -mt-N) est ajoutée au rendu par le filtre PHP
 * render_block_core/image (includes/ufo-tools-blocks-extensions.php). Le HTML
 * enregistré de l'image ne change pas : désactiver le plugin ne la rend pas
 * invalide, elle s'affiche simplement sans marge.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { UfoToolsPanel, PanelItem, MarginTopControl } from '../shared/controls';
import { marginTopClass } from '../shared/margin-top';

const BLOCK = 'core/image';
const DEFAULTS = { ufoMarginTop: '' };

addFilter(
	'blocks.registerBlockType',
	'ufo-tools-blocks/image-margin-top/attribute',
	( settings, name ) =>
		name === BLOCK
			? {
					...settings,
					attributes: {
						...settings.attributes,
						ufoMarginTop: { type: 'string', default: '' },
					},
				}
			: settings
);

addFilter(
	'editor.BlockEdit',
	'ufo-tools-blocks/image-margin-top/control',
	createHigherOrderComponent(
		( BlockEdit ) => ( props ) => {
			if ( props.name !== BLOCK ) {
				return <BlockEdit { ...props } />;
			}
			const { attributes, setAttributes } = props;
			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<UfoToolsPanel
							label={ __(
								'Dimensions (Tailwind)',
								'ufo-tools-blocks'
							) }
							defaults={ DEFAULTS }
							keys={ [ 'ufoMarginTop' ] }
							setAttributes={ setAttributes }
						>
							<PanelItem
								attributes={ attributes }
								defaults={ DEFAULTS }
								setAttributes={ setAttributes }
								label={ __(
									'Marge haute',
									'ufo-tools-blocks'
								) }
								keys={ [ 'ufoMarginTop' ] }
								isShownByDefault
							>
								<MarginTopControl
									value={ attributes.ufoMarginTop }
									onChange={ ( value ) =>
										setAttributes( { ufoMarginTop: value } )
									}
								/>
							</PanelItem>
						</UfoToolsPanel>
					</InspectorControls>
				</>
			);
		},
		'withUfoImageMarginTop'
	)
);

// Aperçu dans l'éditeur : la classe sur l'enveloppe du bloc.
addFilter(
	'editor.BlockListBlock',
	'ufo-tools-blocks/image-margin-top/preview',
	createHigherOrderComponent(
		( BlockListBlock ) => ( props ) => {
			const extra =
				props.name === BLOCK &&
				marginTopClass( props.attributes.ufoMarginTop );
			if ( ! extra ) {
				return <BlockListBlock { ...props } />;
			}
			return (
				<BlockListBlock
					{ ...props }
					className={ [ props.className, extra ]
						.filter( Boolean )
						.join( ' ' ) }
				/>
			);
		},
		'withUfoImageMarginTopPreview'
	)
);
