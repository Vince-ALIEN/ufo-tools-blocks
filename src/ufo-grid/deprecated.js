import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import metadata from './block.json';

/**
 * Anciens formats enregistrés, pour que les grilles existantes restent
 * valides. Elles passent au format actuel (attributs + blocs enfants, rendu
 * par render.php) à la prochaine sauvegarde.
 *
 * Copie figée du save() et de shared.js de la 1.0.8 : shared.js peut
 * maintenant évoluer (aperçu de l'éditeur et render.php) sans toucher au
 * balisage déjà en base, qui doit rester reconnu tel quel.
 */

const ALIGNMENT_CLASSES = {
	top: 'items-start',
	center: 'items-center',
	bottom: 'items-end',
};

const HEIGHT_CLASSES = {
	'h-full': 'h-full',
};

function getWrapperClasses( attributes ) {
	const { minHeight, borderRadius, backgroundImage, paddingX, paddingY } =
		attributes;

	return [
		'relative',
		'ufo-grid-wrapper',
		minHeight === 'screen'
			? 'md:h-screen h-full'
			: minHeight === 'h-full' && 'h-full',
		borderRadius && `rounded-${ borderRadius }`,
		backgroundImage?.url && 'bg-no-repeat',
		paddingX !== undefined && `px-${ paddingX }`,
		paddingY !== undefined && `py-${ paddingY }`,
	]
		.filter( Boolean )
		.join( ' ' );
}

function getInnerClasses( attributes ) {
	const {
		columnsCount,
		rowsCount,
		gap,
		verticalAlignment,
		reverseMobile,
		equalRows,
		minHeight,
		isBoxed,
	} = attributes;

	return [
		reverseMobile ? 'md:grid' : 'grid',
		'grid-cols-1',
		equalRows && 'md:auto-rows-fr',
		'auto-rows-auto',
		gap !== undefined && `gap-${ gap }`,
		columnsCount !== undefined && `md:grid-cols-${ columnsCount }`,
		rowsCount && `grid-rows-${ rowsCount }`,
		ALIGNMENT_CLASSES[ verticalAlignment ],
		reverseMobile && 'flex flex-col-reverse',
		minHeight === 'screen'
			? 'h-full'
			: ( HEIGHT_CLASSES[ minHeight ] ??
				( minHeight && `h-${ minHeight }` ) ),
		isBoxed && 'max-w-content mx-auto w-full',
	]
		.filter( Boolean )
		.join( ' ' );
}

function getWrapperStyle( attributes ) {
	const { backgroundImage, backgroundSize, backgroundPosition } = attributes;

	return backgroundImage?.url
		? {
				backgroundImage: `url(${ backgroundImage.url })`,
				backgroundSize: backgroundSize || 'cover',
				backgroundPosition: backgroundPosition || 'center center',
			}
		: undefined;
}

// Une entrée deprecated n'hérite ni des attributs ni des supports du bloc :
// les attributs n'ont pas changé depuis la 1.0.8. Si block.json les modifie,
// figer ici ceux de la 1.0.8.

// ≤ 1.0.8 : bloc statique, enveloppe et classes dans le HTML enregistré.
const v1 = {
	attributes: metadata.attributes,
	supports: metadata.supports,
	save( { attributes } ) {
		const { backgroundVideo } = attributes;

		const blockProps = useBlockProps.save( {
			className: getWrapperClasses( attributes ),
			style: getWrapperStyle( attributes ),
		} );

		const innerBlocksProps = useInnerBlocksProps.save( {
			className: getInnerClasses( attributes ),
		} );

		return (
			<div { ...blockProps }>
				{ backgroundVideo?.url && (
					<video
						className="absolute inset-0 w-full h-full object-cover -z-10"
						autoPlay
						loop
						muted
						playsInline
					>
						<source src={ backgroundVideo.url } type="video/mp4" />
					</video>
				) }
				<div { ...innerBlocksProps } />
			</div>
		);
	},
};

export default [ v1 ];
