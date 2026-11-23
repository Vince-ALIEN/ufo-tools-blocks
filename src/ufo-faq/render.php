<?php
/**
 * UFO Tools Blocks – FAQ (render.php)
 *
 * Schema JSON-LD FAQPage (includes/ufo-faq-schema.php), enveloppe, puis les
 * ufo-faq-item enfants. Voir includes/ufo-tools-blocks-render.php.
 *
 * Variables disponibles :
 *   $attributes  (array)
 *   $content     (string)
 *   $block       (WP_Block)
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

echo ufo_tools_blocks_faq_schema( $block->parsed_block ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON encodé avec JSON_HEX_TAG.

// Contenu enregistré avant la 1.1.0 : affiché tel quel (voir
// includes/ufo-tools-blocks-render.php), sans le schema partiel (sans
// mainEntity) que produisait save.js, remplacé par le schema complet ci-dessus.
if ( ufo_tools_blocks_is_legacy( $block ) ) {
	echo preg_replace( '/<script\s+type="application\/ld\+json">.*?<\/script>\s*/s', '', $content, 1 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><div class="w-full space-y-3 lg:my-3 my-1 px-2"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div></div>
