<?php
/**
 * Désinstallation : supprime le cache de la dernière release GitHub.
 *
 * Le plugin ne crée ni option ni table. Les contenus (blocs dans les
 * articles et les pages) ne sont pas touchés.
 *
 * @package UfoToolsBlocks
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_site_transient( 'ufo_tools_blocks_github_release' );
