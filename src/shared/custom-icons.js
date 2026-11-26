// Icônes personnalisées absentes de lucide-react : les chiffres 0 à 9
// (Digit0 … Digit9), reprises de ufo-blocks. Même API que les icônes Lucide
// (props size, className…) pour rester interchangeables dans ICONS
// (src/shared/icons.js).
//
// Le style (police, taille, position) vient de src/shared/custom-icons.json,
// aussi lu par scripts/generate-icon-svgs.js pour le SVG PHP équivalent.
//
// Ne pas modifier le balisage produit : les étapes de frise enregistrées par
// ufo-blocks le contiennent (src/ufo-time-line-item/deprecated.js).
import iconStyle from './custom-icons.json';

const { x, y, fontSize, fontWeight, fontFamily } = iconStyle.digitStyle;

function createDigitIcon( digit ) {
	function DigitIcon( { size = 24, className, ...rest } ) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={ size }
				height={ size }
				viewBox="0 0 24 24"
				className={ className }
				{ ...rest }
			>
				<text
					x={ x }
					y={ y }
					textAnchor="middle"
					dominantBaseline="central"
					fontSize={ fontSize }
					fontWeight={ fontWeight }
					fontFamily={ fontFamily }
					fill="currentColor"
					stroke="none"
				>
					{ digit }
				</text>
			</svg>
		);
	}
	DigitIcon.displayName = `Digit${ digit }`;
	return DigitIcon;
}

export const CUSTOM_ICONS = Object.fromEntries(
	iconStyle.digits.map( ( digit ) => [
		`Digit${ digit }`,
		createDigitIcon( digit ),
	] )
);
