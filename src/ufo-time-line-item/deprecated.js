import {
	useBlockProps,
	RichText,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import clsx from 'clsx';
import { ICONS } from '../shared/icons';
import metadata from './block.json';

/**
 * Format enregistré par le plugin ufo-blocks (bloc statique) : la date et le
 * titre n'étaient enregistrés que dans le HTML (<time>, <h3>). Le format
 * actuel les garde dans le commentaire du bloc (rendu par render.php).
 *
 * Copie figée du save() de ufo-blocks : ne pas modifier.
 */

// Couleur « #rrggbb » → rgba() (null sans couleur).
function hexToRgba( hex, alpha ) {
	if ( ! hex ) {
		return null;
	}
	const r = parseInt( hex.slice( 1, 3 ), 16 );
	const g = parseInt( hex.slice( 3, 5 ), 16 );
	const b = parseInt( hex.slice( 5, 7 ), 16 );
	return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;
}

const v1 = {
	attributes: {
		icon: { type: 'string', default: '' },
		date: { type: 'string', source: 'html', selector: 'time' },
		title: { type: 'string', source: 'html', selector: 'h3' },
		textColor: { type: 'string' },
		customTextColor: { type: 'string' },
		markerColor: { type: 'string' },
		customMarkerColor: { type: 'string' },
	},
	supports: metadata.supports,
	save( { attributes } ) {
		const {
			icon,
			date,
			title,
			textColor,
			customTextColor,
			markerColor,
			customMarkerColor,
		} = attributes;
		const IconComponent = ICONS[ icon ];

		const dateBorderStyle = customTextColor
			? { borderColor: customTextColor }
			: undefined;

		const blockProps = useBlockProps.save( {
			className: 'relative ml-3 list-none pb-8 pl-6 last:pb-0',
		} );
		const innerBlocksProps = useInnerBlocksProps.save( {
			className: 'ml-6 text-sm text-gray-600 [&>p:last-child]:mb-0',
		} );

		const markerBgStyle = customMarkerColor
			? { backgroundColor: hexToRgba( customMarkerColor, 0.15 ) }
			: undefined;

		return (
			<li { ...blockProps }>
				<span
					className="absolute -left-13 top-0 h-10 w-10 rounded-full bg-white"
					aria-hidden="true"
				/>
				<span
					className={ clsx(
						'absolute -left-13 top-0 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background',
						! customMarkerColor && 'bg-violet-100'
					) }
					style={ markerBgStyle }
					aria-hidden="true"
				>
					{ IconComponent && (
						<IconComponent
							size={ 24 }
							className={
								markerColor
									? `has-${ markerColor }-color`
									: 'text-violet-600'
							}
						/>
					) }
				</span>

				<RichText.Content
					tagName="time"
					className="inline-block mb-1 ml-6 rounded border-2 border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
					style={ dateBorderStyle }
					value={ date }
				/>

				<RichText.Content
					tagName="h3"
					className={ clsx(
						'my-1 ml-6 text-base md:text-lg font-semibold',
						textColor ? `has-${ textColor }-color` : 'text-gray-900'
					) }
					value={ title }
				/>

				<div { ...innerBlocksProps } />
			</li>
		);
	},
};

export default [ v1 ];
