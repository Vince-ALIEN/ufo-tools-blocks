import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import metadata from './block.json';

/**
 * Anciens formats enregistrés, pour que les cellules existantes restent
 * valides. Elles passent au format actuel (attributs + blocs enfants, rendu
 * par render.php) à la prochaine sauvegarde.
 *
 * Copie figée du save() et de shared.js de la 1.0.8 : shared.js peut
 * maintenant évoluer (aperçu de l'éditeur et render.php) sans toucher au
 * balisage déjà en base, qui doit rester reconnu tel quel.
 */

const ALIGNMENT_CLASSES = {
	top: 'flex flex-col justify-start',
	center: 'flex flex-col justify-center',
	bottom: 'flex flex-col justify-end',
};

const HEIGHT_CLASSES = {
	screen: 'h-screen',
	full: 'h-full',
};

function getTailwindClasses( attributes ) {
	const {
		colSpan,
		colStart,
		colEnd,
		rowSpan,
		rowStart,
		rowEnd,
		minHeight,
		height,
		verticalAlignment,
		borderRadius,
		paddingX,
		paddingY,
		backgroundImage,
	} = attributes;

	return [
		'ufo-row',
		colSpan && `md:col-span-${ colSpan }`,
		colStart && `md:col-start-${ colStart }`,
		colEnd && `md:col-end-${ colEnd }`,
		rowSpan && `row-span-${ rowSpan }`,
		rowStart && `row-start-${ rowStart }`,
		rowEnd && `row-end-${ rowEnd }`,
		height && `h-${ height }`,
		HEIGHT_CLASSES[ minHeight ] ?? ( minHeight && `h-${ minHeight }` ),
		borderRadius && `rounded-${ borderRadius }`,
		paddingX && `px-${ paddingX }`,
		paddingY && `py-${ paddingY }`,
		ALIGNMENT_CLASSES[ verticalAlignment ],
		backgroundImage?.url && 'bg-no-repeat',
	]
		.filter( Boolean )
		.join( ' ' );
}

function getBlockStyle( attributes ) {
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

// ≤ 1.0.8 : bloc statique, classes de placement dans le HTML enregistré.
const v1 = {
	attributes: metadata.attributes,
	supports: metadata.supports,
	save( { attributes } ) {
		const blockProps = useBlockProps.save( {
			className: getTailwindClasses( attributes ),
			style: getBlockStyle( attributes ),
		} );

		const innerBlocksProps = useInnerBlocksProps.save( blockProps );

		return <div { ...innerBlocksProps } />;
	},
};

export default [ v1 ];
