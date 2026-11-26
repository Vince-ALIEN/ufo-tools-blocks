<?php
/**
 * UFO Tools Blocks – Timeline (render.php)
 *
 * Enveloppe (<ol> avec la ligne verticale) autour des ufo-time-line-item
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

// Contenu enregistré par ufo-blocks (bloc statique) : affiché tel quel.
if ( ufo_tools_blocks_is_legacy( $block ) ) {
	echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><ol class="relative border-l-3 border-secondary ml-3 lg:my-3 my-1 px-2"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></ol></div>
