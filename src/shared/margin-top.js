/**
 * Marge haute, à toutes les largeurs : mt-N, ou -mt-N (décalage vers le haut)
 * pour une valeur négative. Utilisée par ufo-row et par
 * l'extension de core/image ; portage PHP :
 * ufo_tools_blocks_margin_top_class().
 *
 * @param {string} value Attribut marge haute ("-16" … "16", pairs).
 * @return {string|false} Classe, ou false sans marge.
 */
export function marginTopClass( value ) {
	const amount = parseInt( value, 10 );
	if ( ! amount ) {
		return false;
	}
	return amount > 0 ? `mt-${ amount }` : `-mt-${ -amount }`;
}
