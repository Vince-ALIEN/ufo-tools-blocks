<?php
/**
 * UFO Tools Blocks – Title
 * Rendu dynamique (render.php)
 *
 * Variables disponibles :
 *   $attributes  (array)    — attributs du bloc
 *   $content     (string)   — HTML sauvegardé (ancien contenu statique, pour compatibilité)
 *   $block       (WP_Block)
 */

defined( 'ABSPATH' ) || exit;

$level          = (int) ( $attributes['level']          ?? 3 );
$title_align    = $attributes['titleAlignment']          ?? 'left';
$text_color     = $attributes['textColor']               ?? '';
$icon_bg_color  = $attributes['iconBgColor']             ?? '';
$custom_icon_bg = $attributes['customIconBgColor']       ?? '';
$icon           = $attributes['icon']                    ?? '';

// ── Contenu du titre ─────────────────────────────────────────────────────────
// source:html → WordPress extrait 'content' du HTML sauvegardé pour les anciens blocs.
// Pour les nouveaux blocs (save=null), 'content' est stocké dans le JSON via setAttributes.
$heading_content = $attributes['content'] ?? '';

// Fallback pour les blocs créés avant la migration save()→null (content stocké en HTML).
if ( empty( $heading_content ) && ! empty( $content ) ) {
	preg_match( '/<h[1-6][^>]*>(.*?)<\/h[1-6]>/si', $content, $m );
	if ( ! empty( $m[1] ) ) {
		$heading_content = $m[1];
	}
}

$tag = 'h' . max( 1, min( 6, $level ) );

// ── Classes ───────────────────────────────────────────────────────────────────
$align_class = 'left' === $title_align ? 'justify-start' : ( 'center' === $title_align ? 'justify-center' : 'justify-end' );

$text_color_class = $text_color ? 'has-' . sanitize_html_class( $text_color ) . '-color' : '';
$title_classes    = trim( 'flex items-center not-prose ' . $text_color_class );
// La classe va aussi sur le titre : theme.json fixe une couleur sur h1…h6,
// qui l'emporte sur la couleur héritée du div parent.
$heading_classes  = trim( 'not-prose ' . $text_color_class );

$icon_color_class = $icon_bg_color ? 'has-' . sanitize_html_class( $icon_bg_color ) . '-color' : '';

// ── Couleur de l'icône + fond à 15 % ─────────────────────────────────────────
// Couleur de la palette → variable CSS du preset ; sinon valeur personnalisée
// (hex, rgb(), oklch()… : le thème utilise oklch, d'où color-mix plutôt
// qu'une conversion hex → rgba).
$icon_color = '';
if ( $icon_bg_color ) {
	$icon_color = 'var(--wp--preset--color--' . sanitize_html_class( $icon_bg_color ) . ')';
} elseif ( $custom_icon_bg && preg_match( '/^[#a-z0-9().,%\s\/-]+$/i', $custom_icon_bg ) ) {
	$icon_color = $custom_icon_bg;
}

$icon_bg_style = '';
if ( $icon_color ) {
	$icon_bg_style = sprintf(
		' style="%s"',
		esc_attr( 'background-color:color-mix(in srgb, ' . $icon_color . ' 15%, transparent);' . ( $icon_bg_color ? '' : 'color:' . $icon_color . ';' ) )
	);
}

// ── Icône SVG ─────────────────────────────────────────────────────────────────
$icon_html = '';
if ( ! empty( $icon ) && function_exists( 'ufo_get_icon_svg' ) ) {
	$svg = ufo_get_icon_svg( $icon, 'size-6 ' . $icon_color_class );
	if ( $svg ) {
		$icon_html = '<span class="rounded-lg p-3 mr-2"' . $icon_bg_style . '>' . $svg . '</span>';
	}
}

// ── Wrapper (classes WP : typographie, couleurs…) ─────────────────────────────
$wrapper_attrs = get_block_wrapper_attributes();

?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="flex px-4 <?php echo esc_attr( $align_class ); ?>">
		<div class="block pr-2">
			<div class="<?php echo esc_attr( $title_classes ); ?>">
				<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<<?php echo esc_html( $tag ); ?> class="<?php echo esc_attr( $heading_classes ); ?>"><?php echo wp_kses_post( $heading_content ); ?></<?php echo esc_html( $tag ); ?>>
			</div>
		</div>
	</div>
</div>
