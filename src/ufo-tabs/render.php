<?php
/**
 * UFO Tools Blocks – Tabs
 * Rendu dynamique (render.php)
 *
 * La barre d'onglets est construite à partir des titres des blocs ufo-tab
 * enfants ; chaque contenu est enveloppé dans son tabpanel. Le premier onglet
 * est ouvert, view.js gère ensuite clic et clavier.
 *
 * Variables disponibles :
 *   $attributes  (array)
 *   $content     (string)   — rendu des onglets enfants (non utilisé)
 *   $block       (WP_Block)
 */

$tabs = array();
foreach ( $block->inner_blocks as $inner ) {
	if ( 'ufo-blocks/ufo-tab' !== $inner->name ) {
		continue;
	}
	$title = trim( wp_strip_all_tags( (string) ( $inner->attributes['title'] ?? '' ) ) );
	$tabs[] = array(
		'title' => '' !== $title
			/* translators: %d: numéro de l'onglet */
			? $title : sprintf( __( 'Onglet %d', 'ufo-tools-blocks' ), count( $tabs ) + 1 ),
		'html'  => $inner->render(),
	);
}

if ( empty( $tabs ) ) {
	return;
}

$uid           = wp_unique_id( 'ufo-tabs-' );
$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'         => 'px-4',
		'data-ufo-tabs' => '',
	)
);

?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="not-prose border-b border-slate-200">
		<div class="flex flex-wrap gap-x-1" role="tablist" aria-label="<?php esc_attr_e( 'Onglets', 'ufo-tools-blocks' ); ?>">
			<?php foreach ( $tabs as $i => $tab ) : ?>
				<button
					type="button"
					class="relative py-4 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap text-slate-600 cursor-pointer after:absolute after:-bottom-px after:inset-x-0 after:w-full after:h-0.5 after:bg-transparent hover:text-primary-700 focus:outline-hidden focus-visible:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-selected:font-semibold aria-selected:text-primary aria-selected:after:bg-primary"
					id="<?php echo esc_attr( $uid . '-tab-' . ( $i + 1 ) ); ?>"
					role="tab"
					aria-selected="<?php echo 0 === $i ? 'true' : 'false'; ?>"
					aria-controls="<?php echo esc_attr( $uid . '-panel-' . ( $i + 1 ) ); ?>"
					tabindex="<?php echo 0 === $i ? '0' : '-1'; ?>"
				><?php echo esc_html( $tab['title'] ); ?></button>
			<?php endforeach; ?>
		</div>
	</div>
	<div class="mt-3">
		<?php foreach ( $tabs as $i => $tab ) : ?>
			<div
				id="<?php echo esc_attr( $uid . '-panel-' . ( $i + 1 ) ); ?>"
				role="tabpanel"
				aria-labelledby="<?php echo esc_attr( $uid . '-tab-' . ( $i + 1 ) ); ?>"
				tabindex="0"
				<?php echo 0 === $i ? '' : 'hidden'; ?>
			><?php echo $tab['html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
		<?php endforeach; ?>
	</div>
</div>
