<?php
/**
 * UFO Tools Blocks – Heading group (render.php)
 *
 * Conteneur .heading-group autour des blocs enfants (étiquette et titre).
 * Couleurs, marges, alignement et ancre sont ajoutés par
 * get_block_wrapper_attributes() (supports du bloc), comme le faisait le
 * save() de ufo-blocks. Voir includes/ufo-tools-blocks-render.php.
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
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'heading-group' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
