<?php

/**
 * Plugin Name:       Ufo Tools Blocks
 * Description:       A set of Gutemberg blocks using Tailwind CSS in WordPress class.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            Vincent LASSERRE
 * License:           GPL-2.0-or-later
 * License URI:       https://www.ufo-agency.com/
 * Text Domain:       ufo-tools-blocks
 * Update URI:        https://github.com/Vince-ALIEN/ufo-tools-blocks
 *
 * @package UfoToolsBlocks
 */

if (!defined("ABSPATH")) {
    exit();
}

// Ancien nom du plugin (≤ 1.8.0). Il enregistre les mêmes blocs : il est
// désactivé à l'activation de celui-ci, et tant qu'il reste actif ce plugin
// ne charge rien pour ne pas enregistrer les blocs deux fois.
const UFO_TOOLS_BLOCKS_PREDECESSOR = 'ufo-blocks/ufo-blocks.php';

register_activation_hook(__FILE__, function () {
    deactivate_plugins(UFO_TOOLS_BLOCKS_PREDECESSOR, true, is_network_admin());
});

if (in_array(UFO_TOOLS_BLOCKS_PREDECESSOR, (array) get_option('active_plugins', array()), true)
    || array_key_exists(UFO_TOOLS_BLOCKS_PREDECESSOR, (array) get_site_option('active_sitewide_plugins', array()))) {
    add_action('admin_notices', function () {
        if (current_user_can('activate_plugins')) {
            printf(
                '<div class="notice notice-warning"><p>%s</p></div>',
                esc_html__('Ufo Tools Blocks remplace Ufo Blocks : désactivez et supprimez Ufo Blocks pour que les blocs soient fournis par Ufo Tools Blocks.', 'ufo-tools-blocks')
            );
        }
    });
    return;
}

require_once plugin_dir_path(__FILE__) . 'includes/ufo-faq-schema.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-ufo-tools-blocks-updater.php';

// Mises à jour depuis les releases GitHub (hors is_admin() : la
// vérification des mises à jour tourne aussi en cron).
add_action('plugins_loaded', function () {
    $updater = new Ufo_Tools_Blocks_Updater(plugin_basename(__FILE__), plugin_dir_path(__FILE__));
    $updater->register_hooks();
});

// Helper SVG pour le rendu dynamique du bloc button
if ( file_exists( __DIR__ . '/includes/ufo-tools-blocks-icons.php' ) ) {
    require_once __DIR__ . '/includes/ufo-tools-blocks-icons.php';
}

function ufo_tools_blocks_block_init()
{
    register_block_type(__DIR__ . "/build/ufo-grid");
    register_block_type(__DIR__ . "/build/ufo-row");
    register_block_type(__DIR__ . "/build/ufo-faq");
    register_block_type(__DIR__ . "/build/ufo-faq-item");
    register_block_type(__DIR__ . "/build/ufo-button");
    register_block_type(__DIR__ . "/build/ufo-buttons-group");
    register_block_type(__DIR__ . "/build/ufo-title");
    register_block_type(__DIR__ . "/build/ufo-icon");
}
add_action("init", "ufo_tools_blocks_block_init");

// Le slug de catégorie reste « ufo-blocks » : les blocs et les plugins
// Ufo Tools (bento, time, logo-slider) s'y rattachent.
function ufo_tools_blocks_register_category($categories) {
    return array_merge(
        $categories,
        array(
            array(
                'slug'  => 'ufo-blocks',
                'title' => __('UFO Blocks', 'ufo-tools-blocks'),
            ),
        )
    );
}
add_filter('block_categories_all', 'ufo_tools_blocks_register_category', 10, 2);
