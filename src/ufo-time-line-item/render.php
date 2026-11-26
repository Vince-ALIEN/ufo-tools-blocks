<?php
/**
 * UFO Tools Blocks – Timeline item (render.php)
 *
 * Marqueur rond (icône), date, titre (attributs date et title, HTML de
 * RichText), puis le contenu = blocs enfants. Même HTML que le save() de
 * ufo-blocks (src/ufo-time-line-item/deprecated.js).
 * Voir includes/ufo-tools-blocks-render.php.
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

$ufo_tl_icon          = is_string( $attributes['icon'] ?? null ) ? $attributes['icon'] : '';
$ufo_tl_date          = (string) ( $attributes['date'] ?? '' );
$ufo_tl_title         = (string) ( $attributes['title'] ?? '' );
$ufo_tl_text_slug     = sanitize_html_class( (string) ( $attributes['textColor'] ?? '' ) );
$ufo_tl_marker_slug   = sanitize_html_class( (string) ( $attributes['markerColor'] ?? '' ) );
$ufo_tl_text_color    = (string) sanitize_hex_color( (string) ( $attributes['customTextColor'] ?? '' ) );
$ufo_tl_marker_bg     = ufo_tools_blocks_time_line_marker_bg( (string) ( $attributes['customMarkerColor'] ?? '' ) );
$ufo_tl_marker_class  = 'absolute -left-13 top-0 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background' . ( '' === $ufo_tl_marker_bg ? ' bg-violet-100' : '' );
$ufo_tl_icon_class    = '' !== $ufo_tl_marker_slug ? 'has-' . $ufo_tl_marker_slug . '-color' : 'text-violet-600';
$ufo_tl_title_class   = 'my-1 ml-6 text-base md:text-lg font-semibold ' . ( '' !== $ufo_tl_text_slug ? 'has-' . $ufo_tl_text_slug . '-color' : 'text-gray-900' );
$ufo_tl_icon_svg      = '' !== $ufo_tl_icon && function_exists( 'ufo_get_icon_svg' ) ? ufo_get_icon_svg( $ufo_tl_icon, $ufo_tl_icon_class, 24 ) : '';

?>
<li <?php echo get_block_wrapper_attributes( array( 'class' => 'relative ml-3 list-none pb-8 pl-6 last:pb-0' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><span class="absolute -left-13 top-0 h-10 w-10 rounded-full bg-white" aria-hidden="true"></span><span class="<?php echo esc_attr( $ufo_tl_marker_class ); ?>"<?php echo '' !== $ufo_tl_marker_bg ? ' style="' . esc_attr( $ufo_tl_marker_bg ) . '"' : ''; ?> aria-hidden="true"><?php echo $ufo_tl_icon_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG construit par ufo_get_icon_svg(). ?></span><time class="inline-block mb-1 ml-6 rounded border-2 border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"<?php echo '' !== $ufo_tl_text_color ? ' style="' . esc_attr( 'border-color:' . $ufo_tl_text_color ) . '"' : ''; ?>><?php echo wp_kses_post( $ufo_tl_date ); ?></time><h3 class="<?php echo esc_attr( $ufo_tl_title_class ); ?>"><?php echo wp_kses_post( $ufo_tl_title ); ?></h3><div class="ml-6 text-sm text-gray-600 [&amp;&gt;p:last-child]:mb-0"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div></li>
