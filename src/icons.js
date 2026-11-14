// icons.js
// Import uniquement les icônes utilisées pour réduire la taille du bundle
import {
	ArrowDownToDot,
	TableOfContents,
	StretchHorizontal,
	LayoutDashboard,
	PanelLeftDashed,
	RectangleHorizontal,
	MessageCircleQuestionMark,
	Link,
	Heading,
	AppWindowMac,
	RectangleEllipsis,
} from 'lucide-react';

// Logo de Lucide (absent de lucide-react), d'après logo.svg du dépôt
// lucide-icons/lucide (licence ISC), en une couleur. Mêmes props que les
// icônes lucide-react pour passer par getBlockIcon.
const LucideLogo = ( { size = 24, color = 'currentColor', ...props } ) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke={ color }
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...props }
	>
		<path d="M14 12C14 9.79086 12.2091 8 10 8C7.79086 8 6 9.79086 6 12C6 16.4183 9.58172 20 14 20C18.4183 20 22 16.4183 22 12C22 8.446 20.455 5.25285 18 3.05557" />
		<path d="M10 12C10 14.2091 11.7909 16 14 16C16.2091 16 18 14.2091 18 12C18 7.58172 14.4183 4 10 4C5.58172 4 2 7.58172 2 12C2 15.5841 3.57127 18.8012 6.06253 21" />
	</svg>
);

// Map des icônes disponibles
const iconMap = {
	ArrowDownToDot,
	TableOfContents,
	StretchHorizontal,
	LayoutDashboard,
	PanelLeftDashed,
	RectangleHorizontal,
	MessageCircleQuestionMark,
	Link,
	Heading,
	AppWindowMac,
	RectangleEllipsis,
	LucideLogo,
};

export const getBlockIcon = ( iconName, options = {} ) => {
	const Icon = iconMap[ iconName ];
	if ( ! Icon ) {
		console.warn(
			`Icon "${ iconName }" not found in iconMap. Add it to icons.js`
		);
		return null;
	}

	const {
		size = 20,
		color = '#F6F6F7',
		background = '#F6F6F7',
		borderRadius = '4px',
	} = options;

	return {
		src: (
			<div
				style={ {
					backgroundColor: background,
					borderRadius,
					padding: '6px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				} }
			>
				<Icon
					size={ size }
					color={ color }
					style={ { fill: 'none' } }
				/>
			</div>
		),
	};
};
