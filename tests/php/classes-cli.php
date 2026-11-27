<?php
/**
 * Pont pour tests/js/classes-php.test.js : lit sur l'entrée standard une liste
 * [ { "fn": "...", "attributes": { ... }, "args": [ ... ] } ] (args facultatif :
 * paramètres suivants) et écrit les classes produites
 * par includes/ufo-tools-blocks-classes.php, dans le même ordre.
 *
 * @package ufo-tools-blocks
 */

define( 'ABSPATH', __DIR__ . '/' );
require dirname( __DIR__, 2 ) . '/includes/ufo-tools-blocks-classes.php';

$ufo_allowed = array(
	'ufo_tools_blocks_grid_wrapper_classes',
	'ufo_tools_blocks_grid_inner_classes',
	'ufo_tools_blocks_row_classes',
	'ufo_tools_blocks_buttons_group_classes',
);

$ufo_cases = json_decode( stream_get_contents( STDIN ), true );
$ufo_out   = array();
foreach ( (array) $ufo_cases as $ufo_case ) {
	if ( ! in_array( $ufo_case['fn'], $ufo_allowed, true ) ) {
		fwrite( STDERR, 'Fonction inconnue : ' . $ufo_case['fn'] . "\n" );
		exit( 1 );
	}
	$ufo_out[] = call_user_func_array( $ufo_case['fn'], array_merge( array( (array) $ufo_case['attributes'] ), (array) ( $ufo_case['args'] ?? array() ) ) );
}
echo json_encode( $ufo_out );
