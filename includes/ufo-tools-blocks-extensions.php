<?php
/**
 * Réglages ajoutés aux blocs core : « Marge haute » de core/image.
 *
 * L'attribut ufoMarginTop n'est enregistré que dans le commentaire du bloc ;
 * la classe (mt-N, -mt-N) est ajoutée au rendu. Le HTML enregistré de l'image
 * ne change pas : sans le plugin, elle reste valide et s'affiche sans marge.
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

/**
 * Déclare ufoMarginTop sur core/image, comme le fait le filtre JS
 * blocks.registerBlockType (src/extensions/image-margin-top.js).
 *
 * @param array  $args       Arguments de register_block_type.
 * @param string $block_type Nom du bloc.
 * @return array
 */
function ufo_tools_blocks_image_margin_top_attribute( $args, $block_type ) {
	if ( 'core/image' === $block_type ) {
		$args['attributes']                 = $args['attributes'] ?? array();
		$args['attributes']['ufoMarginTop'] = array(
			'type'    => 'string',
			'default' => '',
		);
	}
	return $args;
}
add_filter( 'register_block_type_args', 'ufo_tools_blocks_image_margin_top_attribute', 10, 2 );

/**
 * Charge le réglage dans l'éditeur de blocs.
 */
function ufo_tools_blocks_image_margin_top_editor_assets() {
	$asset_file = plugin_dir_path( __DIR__ ) . 'build/extensions/image-margin-top.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}
	$asset = require $asset_file;
	wp_enqueue_script(
		'ufo-tools-blocks-image-margin-top',
		plugins_url( 'build/extensions/image-margin-top.js', __DIR__ ),
		$asset['dependencies'],
		$asset['version'],
		true
	);
	wp_set_script_translations( 'ufo-tools-blocks-image-margin-top', 'ufo-tools-blocks' );
}
add_action( 'enqueue_block_editor_assets', 'ufo_tools_blocks_image_margin_top_editor_assets' );

/**
 * Ajoute la classe de marge haute à l'élément racine de l'image (figure).
 *
 * @param string $block_content HTML rendu du bloc.
 * @param array  $block         Bloc analysé (attrs).
 * @return string
 */
function ufo_tools_blocks_image_margin_top_render( $block_content, $block ) {
	$class_name = ufo_tools_blocks_margin_top_class( $block['attrs']['ufoMarginTop'] ?? null );
	// WP_HTML_Tag_Processor : WordPress 6.2+ (le plugin accepte 6.1).
	if ( '' === $class_name || '' === $block_content || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
		return $block_content;
	}
	$tags = new WP_HTML_Tag_Processor( $block_content );
	if ( $tags->next_tag() ) {
		$tags->add_class( $class_name );
	}
	return $tags->get_updated_html();
}
add_filter( 'render_block_core/image', 'ufo_tools_blocks_image_margin_top_render', 10, 2 );
