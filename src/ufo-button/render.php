<?php
/**
 * UFO Tools Blocks – Button (render.php)
 *
 * Variables disponibles :
 *   $attributes  (array)
 *   $content     (string)
 *   $block       (WP_Block)
 */

defined( 'ABSPATH' ) || exit;

$button_text   = $attributes['buttonText']   ?? '';
$button_url    = $attributes['buttonUrl']    ?? '';
$button_icon   = $attributes['buttonIcon']   ?? '';
$icon_position = $attributes['iconPosition'] ?? 'right';
$opens_new_tab = (bool) ( $attributes['opensInNewTab'] ?? false );
$rel_nofollow  = (bool) ( $attributes['relNofollow']   ?? false );
$is_full_width = (bool) ( $attributes['isFullWidth']   ?? false );
$sr_text       = trim( (string) ( $attributes['screenReaderText'] ?? '' ) );

// ── Attributs rel / target ────────────────────────────────────────────────────
$rel_parts = [];
if ( $opens_new_tab ) {
	$rel_parts[] = 'noopener';
	$rel_parts[] = 'noreferrer';
}
if ( $rel_nofollow ) {
	$rel_parts[] = 'nofollow';
}
// Sans URL, pas de href : un <a> sans href n'est ni focusable ni annoncé
// comme lien (même choix que core/button). href="#" donnerait un faux lien
// qui remonte en haut de page à Entrée. target et rel n'ont de sens qu'avec
// une destination.
$has_url     = '' !== trim( (string) $button_url );
$href_attr   = $has_url ? ' href="' . esc_url( $button_url ) . '"' : '';
$rel_attr    = $has_url && ! empty( $rel_parts ) ? ' rel="' . esc_attr( implode( ' ', $rel_parts ) ) . '"' : '';
$target_attr = $has_url && $opens_new_tab ? ' target="_blank"' : '';

// ── Nom accessible ────────────────────────────────────────────────────────────
// Un lien sans nom (WCAG 2.4.4 / 4.1.2) n'est pas rendu : le libellé visible
// (balises retirées) ou le texte lecteur d'écran doit être renseigné.
if ( '' === trim( wp_strip_all_tags( $button_text ) ) && '' === $sr_text ) {
	return;
}

// ── Texte pour lecteurs d'écran ───────────────────────────────────────────────
// Ajouté après le libellé visible (et non en aria-label, qui le remplacerait :
// le nom accessible doit contenir le texte affiché, WCAG 2.5.3). Les boutons
// ouverts dans un nouvel onglet le signalent automatiquement.
$sr_parts = [];
if ( '' !== $sr_text ) {
	$sr_parts[] = $sr_text;
}
if ( $has_url && $opens_new_tab ) {
	$sr_parts[] = __( '(nouvel onglet)', 'ufo-tools-blocks' );
}
// Masqué visuellement par deux classes : `screen-reader-text` (classe
// WordPress, définie par les thèmes classiques) et `sr-only` (Tailwind) :
// un thème Tailwind ne définit pas forcément `screen-reader-text`, et le
// texte s'affichait alors dans le bouton.
$sr_html = ! empty( $sr_parts )
	? '<span class="screen-reader-text sr-only"> ' . esc_html( implode( ' ', $sr_parts ) ) . '</span>'
	: '';

// ── Icône SVG ─────────────────────────────────────────────────────────────────
$icon_html = '';
if ( ! empty( $button_icon ) && function_exists( 'ufo_get_icon_svg' ) ) {
	$svg = ufo_get_icon_svg( $button_icon, 'stroke-current size-4' );
	if ( $svg ) {
		$icon_html = '<span class="btn__icon h-4 w-4 flex items-center justify-center group-hover:scale-110 transition duration-700 ease-in-out motion-reduce:transition-none" aria-hidden="true">'
			. $svg
			. '</span>';
	}
}

// ── Wrapper ───────────────────────────────────────────────────────────────────
// not-prose : dans un contenu .prose (Tailwind Typography), la règle des liens
// (.prose :where(a), placée après les styles du thème) remplacerait la couleur
// du texte du bouton (blanc des styles is-style-primary / is-style-secondary),
// sa graisse et son soulignement.
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'btn not-prose inline-flex items-center gap-2 no-underline group'
		. ( $has_url ? ' cursor-pointer' : '' )
		. ( $is_full_width ? ' w-full justify-center' : '' ),
] );

?>
<a <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php echo $href_attr;   // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php echo $target_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php echo $rel_attr;    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
>
	<?php if ( 'left' === $icon_position ) : ?>
		<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php endif; ?>
	<span><?php echo wp_kses_post( $button_text ); ?><?php echo $sr_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?></span>
	<?php if ( 'left' !== $icon_position ) : ?>
		<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php endif; ?>
</a>
