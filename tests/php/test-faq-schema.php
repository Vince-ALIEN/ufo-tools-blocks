<?php
/**
 * Tests du filtre JSON-LD de ufo-faq (includes/ufo-faq-schema.php).
 *
 * Autonome, sans WordPress : les quelques fonctions du cœur utilisées sont
 * simulées ci-dessous. Lancer : php tests/php/test-faq-schema.php
 *
 * @package ufo-tools-blocks
 */

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['ufo_test_filters'] = array();

function add_filter( $hook, $callback ) {
	$GLOBALS['ufo_test_filters'][ $hook ] = $callback;
}
function wp_strip_all_tags( $text ) {
	$text = preg_replace( '@<(script|style)[^>]*?>.*?</\\1>@si', '', $text );
	return trim( strip_tags( $text ) );
}
function wp_json_encode( $data, $options = 0 ) {
	return json_encode( $data, $options );
}
function sanitize_text_field( $text ) {
	return trim( preg_replace( '/[\r\n\t ]+/', ' ', strip_tags( $text ) ) );
}

require dirname( __DIR__, 2 ) . '/includes/ufo-faq-schema.php';

$failures = 0;
function check( $label, $condition ) {
	global $failures;
	echo ( $condition ? '  ok   ' : '  FAIL ' ) . $label . "\n";
	if ( ! $condition ) {
		++$failures;
	}
}

function render_faq( $attrs, $items, $content = '<div class="wp-block-ufo-blocks-ufo-faq"></div>' ) {
	$callback = $GLOBALS['ufo_test_filters']['render_block'];
	return $callback( $content, array(
		'blockName'   => 'ufo-blocks/ufo-faq',
		'attrs'       => $attrs,
		'innerBlocks' => $items,
	) );
}

function faq_item( $question, $answers ) {
	return array(
		'blockName'    => 'ufo-blocks/ufo-faq-item',
		'innerBlocks'  => $answers,
		'innerContent' => array_merge(
			array( '<details><summary><span class="faq-question">' . $question . '</span></summary><div class="faq-content">' ),
			array_fill( 0, count( $answers ), null ),
			array( '</div></details>' )
		),
	);
}

function paragraph( $html ) {
	return array(
		'blockName'    => 'core/paragraph',
		'innerBlocks'  => array(),
		'innerContent' => array( '<p>' . $html . '</p>' ),
	);
}

function schema_of( $html ) {
	if ( ! preg_match( '/<script type="application\/ld\+json">(.*?)<\/script>/s', $html, $m ) ) {
		return null;
	}
	return json_decode( $m[1], true );
}

echo "ufo-faq JSON-LD\n";

// 1. XSS : un attribut ne doit jamais fermer la balise <script>.
$payload = '</script><script>alert(1)</script>';
$html    = render_faq(
	array( 'schemaName' => $payload, 'schemaDescription' => $payload, 'schemaAbout' => $payload ),
	array( faq_item( 'Question ?', array( paragraph( 'Réponse &lt;/script&gt;' ) ) ) )
);
check( 'une seule balise <script> dans la sortie', 1 === substr_count( strtolower( $html ), '<script' ) );
check( 'aucun </script> injecté', 1 === substr_count( strtolower( $html ), '</script' ) );
$schema = schema_of( $html );
check( 'le JSON reste valide', is_array( $schema ) );
check( 'la réponse garde son texte', 'Réponse </script>' === $schema['mainEntity'][0]['acceptedAnswer']['text'] );
preg_match( '/<script type="application\/ld\+json">(.*?)<\/script>/s', $html, $json );
check( 'aucun < ni > brut dans le JSON', false === strpbrk( $json[1], '<>' ) );

// 2. Réponse imbriquée (groupe > liste > paragraphe) et entités décodées.
$group = array(
	'blockName'    => 'core/group',
	'innerBlocks'  => array(
		paragraph( 'Premier &amp; second' ),
		array(
			'blockName'    => 'core/list',
			'innerBlocks'  => array(),
			'innerContent' => array( '<ul><li>Un</li><li>Deux</li></ul>' ),
		),
	),
	'innerContent' => array( '<div class="wp-block-group">', null, null, '</div>' ),
);
$schema = schema_of( render_faq( array(), array( faq_item( 'Prix &amp; délais ?', array( $group ) ) ) ) );
check( 'question décodée', 'Prix & délais ?' === $schema['mainEntity'][0]['name'] );
check( 'réponse imbriquée complète', 'Premier & second Un Deux' === $schema['mainEntity'][0]['acceptedAnswer']['text'] );

// 3. Schema incomplet de save.js toujours retiré.
$saved = '<script type="application/ld+json">{"@type":"FAQPage","name":"x"}</script><div class="wp-block-ufo-blocks-ufo-faq"></div>';
$html  = render_faq( array( 'schemaName' => 'x' ), array(), $saved );
check( 'sans question : aucun schema', null === schema_of( $html ) );
$html = render_faq( array( 'enableSchema' => false ), array( faq_item( 'Q ?', array( paragraph( 'R' ) ) ) ), $saved );
check( 'schema désactivé : aucun schema', null === schema_of( $html ) );
$html = render_faq( array( 'schemaName' => 'FAQ' ), array( faq_item( 'Q ?', array( paragraph( 'R' ) ) ) ), $saved );
check( 'un seul schema, complet', 1 === substr_count( $html, 'application/ld+json' ) && 'FAQ' === schema_of( $html )['name'] );

// 4. Autres blocs inchangés.
$callback = $GLOBALS['ufo_test_filters']['render_block'];
check( 'autres blocs inchangés', '<p>x</p>' === $callback( '<p>x</p>', array( 'blockName' => 'core/paragraph' ) ) );

echo $failures ? "\n$failures échec(s)\n" : "\nTous les tests passent\n";
exit( $failures ? 1 : 0 );
