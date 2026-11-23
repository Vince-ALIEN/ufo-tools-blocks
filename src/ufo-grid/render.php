<?php
/**
 * UFO Tools Blocks – Grid (render.php)
 *
 * Enveloppe (hauteur, arrondi, marges, image ou vidéo de fond), grille
 * intérieure, puis les ufo-row enfants. Classes calculées par
 * ufo_tools_blocks_grid_*_classes() (portage de shared.js). Voir
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

$ufo_grid_extra = array( 'class' => ufo_tools_blocks_grid_wrapper_classes( $attributes ) );
$ufo_grid_style = ufo_tools_blocks_background_style( $attributes );
if ( '' !== $ufo_grid_style ) {
	$ufo_grid_extra['style'] = $ufo_grid_style;
}
$ufo_grid_video = esc_url( ufo_tools_blocks_media_url( $attributes['backgroundVideo'] ?? null ) );

?>
<div <?php echo get_block_wrapper_attributes( $ufo_grid_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
<?php if ( '' !== $ufo_grid_video ) : ?>
<video class="absolute inset-0 w-full h-full object-cover -z-10" autoplay loop muted playsinline><source src="<?php echo $ufo_grid_video; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_url() ci-dessus. ?>" type="video/mp4"/></video>
<?php endif; ?>
<div class="<?php echo esc_attr( ufo_tools_blocks_grid_inner_classes( $attributes ) ); ?>"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
</div>
