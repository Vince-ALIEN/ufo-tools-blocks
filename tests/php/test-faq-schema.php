<?php
/**
 * Tests du schema JSON-LD de ufo-faq (includes/ufo-faq-schema.php).
 *
 * Autonome, sans WordPress : les quelques fonctions du cœur utilisées sont
 * simulées ci-dessous. Lancer : php tests/php/test-faq-schema.php
 *
 * @package ufo-tools-blocks
 */

define( 'ABSPATH', __DIR__ . '/' );

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

function render_faq( $attrs, $items ) {
	return ufo_tools_blocks_faq_schema(
		array(
			'blockName'   => 'ufo-blocks/ufo-faq',
			'attrs'       => $attrs,
			'innerBlocks' => $items,
		)
	);
}

// Format actuel (1.1.0) : question dans les attributs, réponse en blocs enfants.
function faq_item( $question, $answers ) {
	return array(
		'blockName'    => 'ufo-blocks/ufo-faq-item',
		'attrs'        => array( 'question' => $question ),
		'innerBlocks'  => $answers,
		'innerContent' => array_merge(
			array( "\n" ),
			array_fill( 0, count( $answers ), null ),
			array( "\n" )
		),
	);
}

// Format ≤ 1.0.8 : question seulement dans le HTML enregistré.
function legacy_faq_item( $question, $answers ) {
	return array(
		'blockName'    => 'ufo-blocks/ufo-faq-item',
		'attrs'        => array(),
		'innerBlocks'  => $answers,
		'innerContent' => array_merge(
			array( '<details class="wp-block-ufo-blocks-ufo-faq-item"><summary><span class="faq-question">' . $question . '</span><span aria-hidden="true" class="ml-4 flex-shrink-0"><span class="group-open:hidden"><svg></svg></span></span></summary><div class="faq-content">' ),
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

// 3. Sans question ou schema désactivé : rien.
check( 'sans question : aucun schema', '' === render_faq( array( 'schemaName' => 'x' ), array() ) );
check( 'schema désactivé : aucun schema', '' === render_faq( array( 'enableSchema' => false ), array( faq_item( 'Q ?', array( paragraph( 'R' ) ) ) ) ) );
$html = render_faq( array( 'schemaName' => 'FAQ' ), array( faq_item( 'Q ?', array( paragraph( 'R' ) ) ) ) );
check( 'un seul schema, complet', 1 === substr_count( $html, 'application/ld+json' ) && 'FAQ' === schema_of( $html )['name'] );

// 4. Contenu enregistré en 1.0.8 : question relue dans le HTML, même quand
// elle contient elle-même un <span> (format Langue de RichText).
$schema = schema_of(
	render_faq(
		array(),
		array(
			legacy_faq_item( 'Ancienne question ?', array( paragraph( 'R1' ) ) ),
			legacy_faq_item( 'Prix <span lang="en">pricing</span> ?', array( paragraph( 'R2' ) ) ),
			faq_item( 'Nouvelle question ?', array( paragraph( 'R3' ) ) ),
		)
	)
);
check( 'question ancienne relue', 'Ancienne question ?' === $schema['mainEntity'][0]['name'] );
check( 'question ancienne avec <span> complète', 'Prix pricing ?' === $schema['mainEntity'][1]['name'] );
check( 'question du format actuel', 'Nouvelle question ?' === $schema['mainEntity'][2]['name'] );

echo $failures ? "\n$failures échec(s)\n" : "\nTous les tests passent\n";
exit( $failures ? 1 : 0 );
