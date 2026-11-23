import {
	useBlockProps,
	RichText,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { Plus, Minus } from 'lucide-react';
import metadata from './block.json';

/**
 * Jusqu'à la 1.0.8, la question n'était enregistrée que dans le HTML
 * (<span class="faq-question">) : les anciens formats la relisent là. Le
 * format actuel la garde dans le commentaire du bloc (rendu par render.php).
 */
const attributes = {
	question: {
		type: 'string',
		source: 'html',
		selector: '.faq-question',
	},
};

const legacySave = ( { border, color } ) =>
	function save( { attributes: { question } } ) {
		const blockProps = useBlockProps.save( {
			className: `group bg-white border ${ border } rounded-md`,
		} );

		const innerBlocksProps = useInnerBlocksProps.save( {
			className: 'faq-content px-6 pb-4',
		} );

		return (
			<details { ...blockProps }>
				<summary
					className={ `flex w-full items-center justify-between px-6 py-6 md:text-lg text-base ${ color } tracking-widest font-sans font-semibold cursor-pointer` }
				>
					<RichText.Content
						tagName="span"
						className="faq-question"
						value={ question }
					/>
					<span aria-hidden="true" className="ml-4 flex-shrink-0">
						<span className="group-open:hidden">
							<Plus size={ 18 } />
						</span>
						<span className="hidden group-open:inline-flex">
							<Minus size={ 18 } />
						</span>
					</span>
				</summary>
				<div { ...innerBlocksProps } />
			</details>
		);
	};

/**
 * 1.0.5 – 1.0.8 : bloc statique, bordure `border-slate-200`.
 */
const v3 = {
	attributes,
	supports: metadata.supports,
	save: legacySave( {
		border: 'border-slate-200',
		color: 'text-primary',
	} ),
};

/**
 * ≤ 1.0.4 : bordure `border-gray-200`, passée en `border-slate-200`.
 */
const v2 = {
	attributes,
	supports: metadata.supports,
	save: legacySave( { border: 'border-gray-200', color: 'text-primary' } ),
};

/**
 * ≤ 1.7.0 (ufo-blocks) : question en `text-violet` (couleur absente de la
 * plupart des thèmes), passée en `text-primary`.
 */
const v1 = {
	attributes,
	supports: metadata.supports,
	save: legacySave( { border: 'border-gray-200', color: 'text-violet' } ),
};

export default [ v3, v2, v1 ];
