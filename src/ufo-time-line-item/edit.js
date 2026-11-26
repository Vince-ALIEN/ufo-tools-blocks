import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
	PanelColorSettings,
	useInnerBlocksProps,
	withColors,
} from '@wordpress/block-editor';
import { PanelBody, BaseControl } from '@wordpress/components';
import clsx from 'clsx';
import { ICONS, ICON_LIST } from '../shared/icons';
import './editor.css';

// Même calcul que ufo_tools_blocks_time_line_marker_bg() (render.php).
function hexToRgba( hex, alpha ) {
	if ( ! hex ) {
		return null;
	}
	const r = parseInt( hex.slice( 1, 3 ), 16 );
	const g = parseInt( hex.slice( 3, 5 ), 16 );
	const b = parseInt( hex.slice( 5, 7 ), 16 );
	return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;
}

function Edit( {
	attributes,
	setAttributes,
	textColor,
	setTextColor,
	markerColor,
	setMarkerColor,
} ) {
	const { icon, date, title } = attributes;
	const IconComponent = ICONS[ icon ];

	const dateBorderStyle = textColor.color
		? { borderColor: textColor.color }
		: undefined;

	// La couleur choisie est aussi gardée en hexadécimal (customTextColor,
	// customMarkerColor) : bordure de la date et fond du marqueur.
	const handleTextColorChange = ( newColor ) => {
		setTextColor( newColor );
		if ( newColor ) {
			setAttributes( { customTextColor: newColor } );
		}
	};

	const handleMarkerColorChange = ( newColor ) => {
		setMarkerColor( newColor );
		if ( newColor ) {
			setAttributes( { customMarkerColor: newColor } );
		}
	};

	const blockProps = useBlockProps( {
		className: 'relative ml-3 list-none pb-8 pl-6 last:pb-0',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'ml-6 text-sm text-gray-600 [&>p:last-child]:mb-0' },
		{ templateLock: false }
	);

	const markerBgStyle = markerColor.color
		? { backgroundColor: hexToRgba( markerColor.color, 0.15 ) }
		: {};

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Icône', 'ufo-tools-blocks' ) }
					initialOpen
				>
					<BaseControl>
						<BaseControl.VisualLabel>
							{ __( 'Choisir une icône', 'ufo-tools-blocks' ) }
						</BaseControl.VisualLabel>
						<div
							className="ufo-icon-picker"
							role="group"
							aria-label={ __(
								'Choisir une icône',
								'ufo-tools-blocks'
							) }
						>
							<button
								type="button"
								className={ clsx( 'ufo-icon-picker__item', {
									'is-selected': ! icon,
								} ) }
								onClick={ () => setAttributes( { icon: '' } ) }
								title={ __(
									'Aucune icône',
									'ufo-tools-blocks'
								) }
								aria-label={ __(
									'Aucune icône',
									'ufo-tools-blocks'
								) }
								aria-pressed={ ! icon }
							>
								<span style={ { fontSize: 10, lineHeight: 1 } }>
									—
								</span>
							</button>
							{ ICON_LIST.map( ( { value, label } ) => {
								const Icon = ICONS[ value ];
								return (
									<button
										type="button"
										key={ value }
										className={ clsx(
											'ufo-icon-picker__item',
											{
												'is-selected': icon === value,
											}
										) }
										onClick={ () =>
											setAttributes( { icon: value } )
										}
										title={ label }
										aria-label={ label }
										aria-pressed={ icon === value }
									>
										<Icon size={ 16 } />
									</button>
								);
							} ) }
						</div>
					</BaseControl>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Couleurs', 'ufo-tools-blocks' ) }
					colorSettings={ [
						{
							value: textColor.color,
							onChange: handleTextColorChange,
							label: __( 'Couleur du titre', 'ufo-tools-blocks' ),
						},
						{
							value: markerColor.color,
							onChange: handleMarkerColorChange,
							label: __(
								'Couleur du marqueur',
								'ufo-tools-blocks'
							),
						},
					] }
				/>
			</InspectorControls>

			<li { ...blockProps }>
				<span
					className="absolute -left-13 top-0 h-10 w-10 rounded-full bg-white"
					aria-hidden="true"
				/>
				<span
					className={ clsx(
						'absolute -left-13 top-0 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background',
						! markerColor.color && 'bg-violet-100'
					) }
					style={ markerBgStyle }
					aria-hidden="true"
				>
					{ IconComponent && (
						<IconComponent
							size={ 24 }
							className={ markerColor.class || 'text-violet-600' }
						/>
					) }
				</span>

				<RichText
					tagName="time"
					className="inline-block mb-1 ml-6 rounded border-2 border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
					style={ dateBorderStyle }
					value={ date }
					onChange={ ( value ) => setAttributes( { date: value } ) }
					placeholder={ __( 'Date…', 'ufo-tools-blocks' ) }
					allowedFormats={ [] }
				/>

				<RichText
					tagName="h3"
					className={ clsx(
						'my-1 ml-6 text-base md:text-lg font-semibold',
						textColor.class || 'text-gray-900'
					) }
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					placeholder={ __(
						'Titre de l’étape…',
						'ufo-tools-blocks'
					) }
				/>

				<div { ...innerBlocksProps } />
			</li>
		</>
	);
}

export default withColors( {
	textColor: 'color',
	markerColor: 'color',
} )( Edit );
