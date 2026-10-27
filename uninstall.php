<?php
/**
 * Suppression des réglages à la désinstallation du plugin.
 *
 * @package UfoToolsBlocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Réglage Tailwind : une option par site sur un multisite.
if ( is_multisite() ) {
	foreach ( get_sites( array( 'fields' => 'ids', 'number' => 0 ) ) as $ufo_tools_blocks_site_id ) {
		delete_blog_option( $ufo_tools_blocks_site_id, 'ufo_tools_blocks_tailwind' );
	}
} else {
	delete_option( 'ufo_tools_blocks_tailwind' );
}

// Cache de la dernière release GitHub (updater), commun au réseau.
delete_site_transient( 'ufo_tools_blocks_github_release' );
