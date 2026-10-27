<?php
/**
 * UFO Tools Blocks – Icon
 * Rendu dynamique (render.php)
 *
 * Variables disponibles :
 *   $attributes  (array)    — attributs du bloc
 *   $content     (string)   — toujours vide (save = null)
 *   $block       (WP_Block)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


$icon      = $attributes['icon']     ?? '';
$icon_size = (int) ( $attributes['iconSize'] ?? 32 );

if ( empty( $icon ) ) {
	return;
}

$svg = ufo_get_icon_svg( $icon, '', $icon_size );

if ( empty( $svg ) ) {
	return;
}

$text_align = $attributes['textAlign'] ?? 'left';

// text-align ne positionne pas un SVG — on utilise display:flex + justify-content.
// get_block_wrapper_attributes() fusionne ce style avec ceux générés par les supports
// (couleur text/background, spacing).
$justify_map = [
	'left'   => 'flex-start',
	'center' => 'center',
	'right'  => 'flex-end',
];
$text_align = isset( $justify_map[ $text_align ] ) ? $text_align : 'left';
$justify    = $justify_map[ $text_align ];

$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'ufo-icon-block has-text-align-' . $text_align,
	'style' => 'display:flex;align-items:center;justify-content:' . $justify . ';',
] );

?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>
