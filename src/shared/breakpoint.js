/**
 * Point de rupture à partir duquel une ufo-grid passe en colonnes (préfixe
 * Tailwind de grid-cols-N, auto-rows-fr, etc.). ufo-grid le transmet à ses
 * ufo-row par le contexte `ufo-blocks/breakpoint` (col-span, col-start,
 * col-end). `none` : colonnes à toutes les largeurs, classes sans préfixe.
 * Portage PHP : ufo_tools_blocks_breakpoint(), ufo_tools_blocks_at().
 */
export const BREAKPOINTS = [ 'none', 'sm', 'md', 'lg', 'xl' ];

export const DEFAULT_BREAKPOINT = 'md';

/**
 * Point de rupture valide, `md` sinon (contenu enregistré sans l'attribut).
 *
 * @param {string|undefined} value Valeur de l'attribut ou du contexte.
 * @return {string} none, sm, md, lg ou xl.
 */
export function breakpointOf( value ) {
	return BREAKPOINTS.includes( value ) ? value : DEFAULT_BREAKPOINT;
}

/**
 * Classe Tailwind active à partir du point de rupture.
 *
 * @param {string} breakpoint Résultat de breakpointOf().
 * @param {string} className  Classe sans préfixe.
 * @return {string} `lg:grid-cols-2`, ou `grid-cols-2` pour `none`.
 */
export function at( breakpoint, className ) {
	return breakpoint === 'none' ? className : `${ breakpoint }:${ className }`;
}
