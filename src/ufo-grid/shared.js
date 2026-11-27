import { breakpointOf, at } from '../shared/breakpoint';

export const ALIGNMENT_CLASSES = {
	top: 'items-start',
	center: 'items-center',
	bottom: 'items-end',
};

const HEIGHT_CLASSES = {
	'h-full': 'h-full',
};

export function getWrapperClasses( attributes ) {
	const { minHeight, borderRadius, backgroundImage, paddingX, paddingY } =
		attributes;
	const bp = breakpointOf( attributes.breakpoint );

	return [
		'relative',
		'ufo-grid-wrapper',
		minHeight === 'screen' &&
			( bp === 'none' ? 'h-screen' : `${ bp }:h-screen h-full` ),
		minHeight === 'h-full' && 'h-full',
		borderRadius && `rounded-${ borderRadius }`,
		backgroundImage?.url && 'bg-no-repeat',
		paddingX !== undefined && `px-${ paddingX }`,
		paddingY !== undefined && `py-${ paddingY }`,
	]
		.filter( Boolean )
		.join( ' ' );
}

export function getInnerClasses( attributes ) {
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
	const bp = breakpointOf( attributes.breakpoint );
	// Sans point de rupture, pas d'état « mobile » : ni inversion, ni classes
	// de base que les classes sans préfixe contrediraient.
	const always = bp === 'none';
	const reverse = reverseMobile && ! always;
	const hasColumns = columnsCount !== undefined;

	return [
		reverse ? at( bp, 'grid' ) : 'grid',
		! ( always && hasColumns ) && 'grid-cols-1',
		equalRows && at( bp, 'auto-rows-fr' ),
		! ( always && equalRows ) && 'auto-rows-auto',
		gap !== undefined && `gap-${ gap }`,
		hasColumns && at( bp, `grid-cols-${ columnsCount }` ),
		rowsCount && `grid-rows-${ rowsCount }`,
		ALIGNMENT_CLASSES[ verticalAlignment ],
		reverse && 'flex flex-col-reverse',
		minHeight === 'screen'
			? 'h-full'
			: ( HEIGHT_CLASSES[ minHeight ] ??
				( minHeight && `h-${ minHeight }` ) ),
		isBoxed && 'max-w-content mx-auto w-full',
	]
		.filter( Boolean )
		.join( ' ' );
}

export function getWrapperStyle( attributes ) {
	const { backgroundImage, backgroundSize, backgroundPosition } = attributes;

	return backgroundImage?.url
		? {
				backgroundImage: `url(${ backgroundImage.url })`,
				backgroundSize: backgroundSize || 'cover',
				backgroundPosition: backgroundPosition || 'center center',
			}
		: undefined;
}
