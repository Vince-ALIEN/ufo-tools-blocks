<?php
/**
 * UFO Tools Blocks – Row (render.php)
 *
 * Cellule de ufo-grid : classes de placement calculées par
 * ufo_tools_blocks_row_classes() (portage de shared.js), puis les blocs
 * enfants. Voir includes/ufo-tools-blocks-render.php.
 *
 * Variables disponibles :
 *   $attributes  (array)
 *   $content     (string)
 *   $block       (WP_Block)
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

// Contenu enregistré avant la 1.1.0 : affiché tel quel (voir
// includes/ufo-tools-blocks-render.php).
if ( ufo_tools_blocks_is_legacy( $block ) ) {
	echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

$ufo_row_extra = array(
	'class' => ufo_tools_blocks_row_classes( $attributes, $block->context['ufo-blocks/breakpoint'] ?? null ),
);
$ufo_row_style = ufo_tools_blocks_background_style( $attributes );
if ( '' !== $ufo_row_style ) {
	$ufo_row_extra['style'] = $ufo_row_style;
}

?>
<div <?php echo get_block_wrapper_attributes( $ufo_row_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
