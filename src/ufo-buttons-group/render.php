<?php
/**
 * UFO Tools Blocks – Buttons group (render.php)
 *
 * Enveloppe du groupe, puis les ufo-button enfants. Voir
 * includes/ufo-tools-blocks-render.php.
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

?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><div class="<?php echo esc_attr( ufo_tools_blocks_buttons_group_classes( $attributes ) ); ?>"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div></div>
