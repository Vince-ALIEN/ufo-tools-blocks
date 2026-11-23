<?php
/**
 * Rendu front de tous les contenus qui utilisent des blocs ufo-blocks/*.
 *
 * Sert à vérifier qu'une version du plugin ne change pas le HTML affiché :
 * lancer le script avant la mise à jour, puis après, et comparer les deux
 * dossiers.
 *
 *     ddev wp eval-file wp-content/plugins/ufo-tools-blocks/scripts/check-rendering.php /tmp/avant
 *     (mise à jour du plugin)
 *     ddev wp eval-file wp-content/plugins/ufo-tools-blocks/scripts/check-rendering.php /tmp/apres
 *     diff -r /tmp/avant /tmp/apres
 *
 * Couvre les articles, pages, blocs réutilisables, modèles et parties de
 * modèle (tous statuts, révisions exclues) et les patterns enregistrés. Le
 * HTML est normalisé (classes et déclarations de style triées, espaces entre
 * balises supprimés) : seules les différences visibles restent.
 *
 * Le dossier de sortie doit être accessible au PHP du site (dans DDEV : un
 * chemin du conteneur, par exemple /var/www/html/wp-content/uploads/…).
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

$ufo_out = isset( $args[0] ) ? rtrim( $args[0], '/' ) : '';
if ( '' === $ufo_out ) {
	WP_CLI::error( 'Indiquer le dossier de sortie : wp eval-file check-rendering.php <dossier>' );
}
wp_mkdir_p( $ufo_out );

/**
 * HTML normalisé : classes et styles triés, espaces entre balises retirés.
 *
 * @param string $html HTML rendu.
 * @return string
 */
function ufo_check_rendering_normalize( $html ) {
	$tags = new WP_HTML_Tag_Processor( $html );
	while ( $tags->next_tag() ) {
		$class = $tags->get_attribute( 'class' );
		if ( is_string( $class ) ) {
			$list = array_unique( preg_split( '/\s+/', trim( $class ), -1, PREG_SPLIT_NO_EMPTY ) );
			sort( $list );
			$tags->set_attribute( 'class', implode( ' ', $list ) );
		}
		$style = $tags->get_attribute( 'style' );
		if ( is_string( $style ) ) {
			$rules = array_filter( array_map( 'trim', explode( ';', $style ) ) );
			$rules = array_map(
				static function ( $rule ) {
					return preg_replace( '/\s*:\s*/', ':', $rule, 1 );
				},
				$rules
			);
			sort( $rules );
			$tags->set_attribute( 'style', implode( ';', $rules ) );
		}
	}
	$html = $tags->get_updated_html();
	// Attributs de chaque balise triés par nom (l'ordre n'a pas d'effet).
	$html = preg_replace_callback(
		'/<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:="[^"]*")?)+)\s*(\/?)>/',
		static function ( $m ) {
			preg_match_all( '/[^\s=>\/]+(?:="[^"]*")?/', $m[2], $attrs );
			$list = $attrs[0];
			sort( $list );
			return '<' . $m[1] . ' ' . implode( ' ', $list ) . $m[3] . '>';
		},
		$html
	);
	$html = preg_replace( '/>\s+</', '><', $html );
	return trim( preg_replace( '/[ \t]+/', ' ', $html ) ) . "\n";
}

/**
 * Rend un contenu de blocs et l'écrit dans le dossier de sortie.
 *
 * @param string $dir     Dossier de sortie.
 * @param string $name    Nom du fichier.
 * @param string $content Balisage des blocs.
 */
function ufo_check_rendering_write( $dir, $name, $content ) {
	$html = ufo_check_rendering_normalize( do_blocks( $content ) );
	file_put_contents( $dir . '/' . sanitize_file_name( $name ) . '.html', $html ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
}

$ufo_count = 0;

$ufo_posts = get_posts(
	array(
		'post_type'      => array( 'post', 'page', 'wp_block', 'wp_template', 'wp_template_part' ),
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'orderby'        => 'ID',
		'order'          => 'ASC',
		's'              => 'wp:ufo-blocks/',
	)
);
foreach ( $ufo_posts as $ufo_post ) {
	if ( false === strpos( $ufo_post->post_content, '<!-- wp:ufo-blocks/' ) ) {
		continue;
	}
	ufo_check_rendering_write( $ufo_out, $ufo_post->post_type . '-' . $ufo_post->ID, $ufo_post->post_content );
	++$ufo_count;
}

foreach ( WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $ufo_pattern ) {
	if ( empty( $ufo_pattern['content'] ) || false === strpos( $ufo_pattern['content'], '<!-- wp:ufo-blocks/' ) ) {
		continue;
	}
	ufo_check_rendering_write( $ufo_out, 'pattern-' . str_replace( '/', '--', $ufo_pattern['name'] ), $ufo_pattern['content'] );
	++$ufo_count;
}

// Fixtures : balisage de la 1.0.8 (fixture-*) et sa version migrée au format
// actuel (migrated-*). Les deux rendus doivent être identiques.
foreach ( array( 'fixture-' => '/../tests/fixtures/', 'migrated-' => '/../tests/fixtures/migrated/' ) as $ufo_prefix => $ufo_dir ) {
	foreach ( (array) glob( __DIR__ . $ufo_dir . '*.html' ) as $ufo_fixture ) {
		ufo_check_rendering_write( $ufo_out, $ufo_prefix . basename( $ufo_fixture, '.html' ), (string) file_get_contents( $ufo_fixture ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		++$ufo_count;
	}
}

WP_CLI::success( sprintf( '%d contenus rendus dans %s', $ufo_count, $ufo_out ) );
