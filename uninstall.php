<?php
/**
 * Suppression des réglages à la désinstallation du plugin.
 *
 * @package UfoToolsBlocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'ufo_tools_blocks_tailwind' );
