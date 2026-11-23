<?php
/**
 * UFO Tools Blocks – FAQ item (render.php)
 *
 * Question (attribut question, HTML de RichText) dans le <summary>, réponse =
 * blocs enfants.
 * Voir
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

$ufo_faq_question = (string) ( $attributes['question'] ?? '' );

// Icônes Lucide Plus / Minus (18 px), identiques au rendu de lucide-react.
$ufo_faq_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-%s" aria-hidden="true">%s</svg>';

?>
<details <?php echo get_block_wrapper_attributes( array( 'class' => 'group bg-white border border-slate-200 rounded-md' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><summary class="flex w-full items-center justify-between px-6 py-6 md:text-lg text-base text-primary tracking-widest font-sans font-semibold cursor-pointer"><span class="faq-question"><?php echo wp_kses_post( $ufo_faq_question ); ?></span><span aria-hidden="true" class="ml-4 flex-shrink-0"><span class="group-open:hidden"><?php printf( $ufo_faq_svg, 'plus', '<path d="M5 12h14"></path><path d="M12 5v14"></path>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span><span class="hidden group-open:inline-flex"><?php printf( $ufo_faq_svg, 'minus', '<path d="M5 12h14"></path>' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span></span></summary><div class="faq-content px-6 pb-4"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div></details>
