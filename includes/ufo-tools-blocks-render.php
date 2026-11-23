<?php
/**
 * Aides au rendu serveur des blocs à enfants (render.php).
 *
 * Depuis la 1.1.0, ufo-grid, ufo-row, ufo-buttons-group, ufo-faq,
 * ufo-faq-item et ufo-tab n'enregistrent plus que leurs attributs et leurs
 * blocs enfants : le HTML d'enveloppe est produit à l'affichage, autour de
 * $content (rendu des blocs enfants, déjà calculé par WordPress : ne pas
 * rendre $block->inner_blocks une seconde fois).
 *
 * Les contenus enregistrés avant la 1.1.0 gardent leur ancienne enveloppe HTML
 * dans post_content jusqu'à leur prochaine sauvegarde dans l'éditeur. Pour eux,
 * $content contient déjà cette enveloppe, avec les blocs enfants : il est
 * affiché tel quel, exactement comme en 1.0.8.
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

/**
 * Le bloc est enregistré dans l'ancien format statique (≤ 1.0.8) : son
 * post_content contient du HTML propre, hors blocs enfants et espaces.
 *
 * @param WP_Block $block Bloc.
 * @return bool
 */
function ufo_tools_blocks_is_legacy( WP_Block $block ) {
	$chunks = isset( $block->parsed_block['innerContent'] ) ? (array) $block->parsed_block['innerContent'] : array();
	return '' !== trim( implode( '', array_filter( $chunks, 'is_string' ) ) );
}

/**
 * Style d'image de fond de ufo-grid / ufo-row (getWrapperStyle /
 * getBlockStyle), vide sans image.
 *
 * Les valeurs viennent du commentaire de bloc (modifiable par un
 * contributeur) : l'URL est nettoyée par esc_url_raw() et les caractères qui
 * permettraient de sortir de url(…) ou d'ajouter une déclaration sont
 * encodés ; taille et position ne gardent que lettres, chiffres, espaces et
 * « . % - ».
 *
 * @param array $attributes Attributs du bloc.
 * @return string
 */
function ufo_tools_blocks_background_style( array $attributes ) {
	$url = esc_url_raw( ufo_tools_blocks_media_url( $attributes['backgroundImage'] ?? null ) );
	if ( '' === $url ) {
		return '';
	}
	$url = strtr(
		$url,
		array(
			'('  => '%28',
			')'  => '%29',
			'"'  => '%22',
			"'"  => '%27',
			' '  => '%20',
			'\\' => '%5C',
			';'  => '%3B',
		)
	);

	$size     = $attributes['backgroundSize'] ?? '';
	$position = $attributes['backgroundPosition'] ?? '';
	$size     = is_string( $size ) ? preg_replace( '/[^a-z0-9 .%-]/i', '', $size ) : '';
	$position = is_string( $position ) ? preg_replace( '/[^a-z0-9 .%-]/i', '', $position ) : '';
	$size     = '' !== $size ? $size : 'cover';
	$position = '' !== $position ? $position : 'center center';

	return safecss_filter_attr(
		sprintf(
			'background-image:url(%s);background-size:%s;background-position:%s',
			$url,
			$size,
			$position
		)
	);
}
