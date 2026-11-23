<?php
/**
 * Routes REST pour les assistants IA qui écrivent du contenu par l'API.
 *
 *   GET  /wp-json/ufo-tools-blocks/v1/guide  guide d'usage des blocs (Markdown)
 *                                            et version du plugin installée
 *   POST /wp-json/ufo-tools-blocks/v1/check  vérifie un balisage de blocs sans
 *                                            rien enregistrer, éventuellement pour
 *                                            un type de contenu (post_type)
 *
 * Réservées aux utilisateurs qui peuvent écrire des contenus (edit_posts).
 * Voir docs/blocs-pour-ia.md.
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

/** Taille maximale du contenu vérifié par /check (octets). */
const UFO_TOOLS_BLOCKS_CHECK_MAX_BYTES = 1048576;

/** Profondeur maximale d'imbrication des blocs vérifiée par /check. */
const UFO_TOOLS_BLOCKS_CHECK_MAX_DEPTH = 40;

/**
 * Nombre maximal de constats détaillés par niveau (erreurs, avertissements)
 * dans la réponse de /check : sans plafond, 1 Mo de blocs inconnus donnait
 * une réponse de plus de 4 Mo. Les suivants sont seulement comptés.
 */
const UFO_TOOLS_BLOCKS_CHECK_MAX_ISSUES = 200;

/**
 * Blocs du plugin statiques jusqu'à la 1.0.8 : leur ancien HTML enregistré
 * reste accepté (affiché tel quel, migré à la sauvegarde dans l'éditeur).
 */
const UFO_TOOLS_BLOCKS_FORMERLY_STATIC = array(
	'ufo-blocks/ufo-grid',
	'ufo-blocks/ufo-row',
	'ufo-blocks/ufo-faq',
	'ufo-blocks/ufo-faq-item',
	'ufo-blocks/ufo-buttons-group',
	'ufo-blocks/ufo-tab',
);

/**
 * Blocs du plugin toujours rendus par le serveur : aucun HTML enregistré.
 */
const UFO_TOOLS_BLOCKS_ALWAYS_DYNAMIC = array(
	'ufo-blocks/ufo-button',
	'ufo-blocks/ufo-title',
	'ufo-blocks/ufo-icon',
	'ufo-blocks/ufo-tabs',
);

/**
 * Version installée, lue dans l'en-tête du plugin.
 *
 * @return string
 */
function ufo_tools_blocks_version() {
	$data = get_file_data( dirname( __DIR__ ) . '/ufo-tools-blocks.php', array( 'Version' => 'Version' ) );
	return (string) $data['Version'];
}

/**
 * Enregistre les routes.
 */
function ufo_tools_blocks_register_rest_routes() {
	$can_edit = static function () {
		return current_user_can( 'edit_posts' );
	};

	register_rest_route(
		'ufo-tools-blocks/v1',
		'/guide',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ufo_tools_blocks_rest_guide',
			'permission_callback' => $can_edit,
		)
	);

	register_rest_route(
		'ufo-tools-blocks/v1',
		'/check',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'ufo_tools_blocks_rest_check',
			'permission_callback' => $can_edit,
			'args'                => array(
				'content' => array(
					'description' => __( 'Balisage de blocs à vérifier (post_content).', 'ufo-tools-blocks' ),
					'type'        => 'string',
					'required'    => true,
					'maxLength'   => UFO_TOOLS_BLOCKS_CHECK_MAX_BYTES,
				),
				'post_type' => array(
					'description'       => __( 'Type de contenu de destination (page, post…) : signale les blocs qui n’y sont pas utilisés.', 'ufo-tools-blocks' ),
					'type'              => 'string',
					'validate_callback' => static function ( $value ) {
						return post_type_exists( (string) $value )
							? true
							: new WP_Error( 'rest_invalid_param', __( 'Type de contenu inconnu.', 'ufo-tools-blocks' ), array( 'status' => 400 ) );
					},
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'ufo_tools_blocks_register_rest_routes' );

/**
 * Blocs non utilisés dans un type de contenu, signalés en erreur par /check
 * quand post_type est fourni.
 *
 * Par défaut, les articles n'utilisent ni ufo-grid ni ufo-row (mise en page
 * réservée aux pages). Un site peut changer la règle :
 *
 *     add_filter( 'ufo_tools_blocks_check_disallowed_blocks', function ( $blocks, $post_type ) {
 *         return 'realisation' === $post_type ? array( 'ufo-blocks/ufo-tabs' ) : $blocks;
 *     }, 10, 2 );
 *
 * @param string $post_type Type de contenu.
 * @return string[] Noms de blocs.
 */
function ufo_tools_blocks_check_disallowed_blocks( $post_type ) {
	$defaults = array(
		'post' => array( 'ufo-blocks/ufo-grid', 'ufo-blocks/ufo-row' ),
	);
	$blocks   = apply_filters( 'ufo_tools_blocks_check_disallowed_blocks', $defaults[ $post_type ] ?? array(), $post_type );
	return array_values( array_filter( (array) $blocks, 'is_string' ) );
}

/**
 * GET /guide : guide Markdown copié dans build/ au build (docs/ dans une copie
 * git).
 *
 * @return WP_REST_Response|WP_Error
 */
function ufo_tools_blocks_rest_guide() {
	$root = dirname( __DIR__ );
	foreach ( array( $root . '/build/blocs-pour-ia.md', $root . '/docs/blocs-pour-ia.md' ) as $file ) {
		if ( is_readable( $file ) ) {
			return rest_ensure_response(
				array(
					'version' => ufo_tools_blocks_version(),
					'format'  => 'markdown',
					'guide'   => (string) file_get_contents( $file ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Fichier local du plugin.
				)
			);
		}
	}
	return new WP_Error( 'ufo_tools_blocks_no_guide', __( 'Guide introuvable : lancer npm run build.', 'ufo-tools-blocks' ), array( 'status' => 500 ) );
}

/**
 * POST /check : vérifie un balisage de blocs, sans l'enregistrer.
 *
 * @param WP_REST_Request $request Requête.
 * @return WP_REST_Response
 */
function ufo_tools_blocks_rest_check( WP_REST_Request $request ) {
	$content   = (string) $request->get_param( 'content' );
	$post_type = $request->get_param( 'post_type' );
	$post_type = is_string( $post_type ) && '' !== $post_type ? $post_type : null;
	$report    = array(
		'disallowed' => null === $post_type ? array() : ufo_tools_blocks_check_disallowed_blocks( $post_type ),
		'post_type'  => $post_type,
		'errors'     => array(),
		'warnings'   => array(),
		'counts'     => array(
			'errors'   => 0,
			'warnings' => 0,
		),
		'blocks'     => 0,
	);

	ufo_tools_blocks_check_blocks( parse_blocks( $content ), null, array(), '', $report );

	return rest_ensure_response(
		array(
			'valid'         => 0 === $report['counts']['errors'],
			'version'       => ufo_tools_blocks_version(),
			'post_type'     => $post_type,
			'blocks'        => $report['blocks'],
			'error_count'   => $report['counts']['errors'],
			'warning_count' => $report['counts']['warnings'],
			// Vrai si errors ou warnings ne listent pas tous les constats.
			'truncated'     => $report['counts']['errors'] > count( $report['errors'] )
				|| $report['counts']['warnings'] > count( $report['warnings'] ),
			'errors'        => $report['errors'],
			'warnings'      => $report['warnings'],
		)
	);
}

/**
 * Ajoute un problème au rapport (compté, et détaillé dans la limite de
 * UFO_TOOLS_BLOCKS_CHECK_MAX_ISSUES).
 *
 * @param array       $report  Rapport (modifié).
 * @param string      $level   errors ou warnings.
 * @param string|null $name    Nom du bloc.
 * @param string      $path    Position (indices séparés par des points).
 * @param string      $message Message.
 */
function ufo_tools_blocks_check_report( array &$report, $level, $name, $path, $message ) {
	++$report['counts'][ $level ];
	if ( count( $report[ $level ] ) >= UFO_TOOLS_BLOCKS_CHECK_MAX_ISSUES ) {
		return;
	}
	$report[ $level ][] = array(
		'block'   => $name,
		'path'    => $path,
		'message' => $message,
	);
}

/**
 * Type JSON exact, comme l'éditeur : rest_validate_value_from_schema() accepte
 * "3" pour un nombre ou "true" pour un booléen, l'éditeur les remplace par la
 * valeur par défaut.
 *
 * @param mixed $value  Valeur de l'attribut.
 * @param array $schema Définition de l'attribut.
 * @return bool
 */
function ufo_tools_blocks_check_strict_type( $value, array $schema ) {
	foreach ( (array) $schema['type'] as $type ) {
		switch ( $type ) {
			case 'string':
				$ok = is_string( $value );
				break;
			case 'number':
				$ok = is_int( $value ) || is_float( $value );
				break;
			case 'integer':
				$ok = is_int( $value );
				break;
			case 'boolean':
				$ok = is_bool( $value );
				break;
			case 'object':
				$ok = is_array( $value ) && ( empty( $value ) || ! wp_is_numeric_array( $value ) );
				break;
			case 'array':
				$ok = is_array( $value ) && ( empty( $value ) || wp_is_numeric_array( $value ) );
				break;
			default:
				$ok = null === $value;
		}
		if ( $ok ) {
			return true;
		}
	}
	return false;
}

/**
 * Le schéma d'attribut peut être validé par rest_validate_value_from_schema()
 * (certains blocs déclarent des types propres à l'éditeur, comme rich-text).
 *
 * @param array $schema Définition de l'attribut (block.json).
 * @return bool
 */
function ufo_tools_blocks_check_schema_supported( array $schema ) {
	if ( ! isset( $schema['type'] ) ) {
		return false;
	}
	$known = array( 'string', 'number', 'integer', 'boolean', 'object', 'array', 'null' );
	return empty( array_diff( (array) $schema['type'], $known ) );
}

/**
 * Vérifie une liste de blocs parsés et leurs enfants.
 *
 * @param array       $blocks    Blocs (parse_blocks()).
 * @param string|null $parent    Nom du bloc parent.
 * @param array       $ancestors Noms des ancêtres.
 * @param string      $prefix    Position du parent.
 * @param array       $report    Rapport (modifié).
 */
function ufo_tools_blocks_check_blocks( array $blocks, $parent, array $ancestors, $prefix, array &$report ) {
	$registry = WP_Block_Type_Registry::get_instance();

	foreach ( $blocks as $index => $block ) {
		$path = '' === $prefix ? (string) $index : $prefix . '.' . $index;
		$name = $block['blockName'] ?? null;
		$html = implode( '', array_filter( (array) ( $block['innerContent'] ?? array() ), 'is_string' ) );

		// Un délimiteur resté dans le HTML n'a pas été reconnu par le parseur
		// (JSON d'attributs invalide, commentaire mal fermé…).
		if ( preg_match( '/<!--\s*\/?wp:/', $html ) ) {
			ufo_tools_blocks_check_report( $report, 'errors', $name, $path, __( 'Commentaire de bloc mal formé (JSON des attributs invalide ou balise mal fermée).', 'ufo-tools-blocks' ) );
		}

		if ( null === $name ) {
			if ( '' !== trim( $html ) ) {
				ufo_tools_blocks_check_report( $report, 'warnings', null, $path, __( 'HTML libre hors de tout bloc (bloc « Classique ») : l’envelopper dans un bloc.', 'ufo-tools-blocks' ) );
			}
			continue;
		}

		++$report['blocks'];
		$type = $registry->get_registered( $name );
		if ( ! $type ) {
			ufo_tools_blocks_check_report( $report, 'errors', $name, $path, __( 'Bloc inconnu sur ce site.', 'ufo-tools-blocks' ) );
			continue;
		}

		if ( in_array( $name, $report['disallowed'], true ) ) {
			/* translators: %s: type de contenu (post, page…) */
			ufo_tools_blocks_check_report( $report, 'errors', $name, $path, sprintf( __( 'Bloc non utilisé dans ce type de contenu (%s) : le retirer en gardant ses blocs enfants.', 'ufo-tools-blocks' ), $report['post_type'] ) );
		}

		if ( ! empty( $type->parent ) && ! in_array( $parent, (array) $type->parent, true ) ) {
			/* translators: %s: noms des blocs parents autorisés */
			ufo_tools_blocks_check_report( $report, 'errors', $name, $path, sprintf( __( 'Doit être directement dans : %s.', 'ufo-tools-blocks' ), implode( ', ', (array) $type->parent ) ) );
		}
		if ( ! empty( $type->ancestor ) && ! array_intersect( (array) $type->ancestor, $ancestors ) ) {
			/* translators: %s: noms des blocs ancêtres autorisés */
			ufo_tools_blocks_check_report( $report, 'errors', $name, $path, sprintf( __( 'Doit être à l’intérieur de : %s.', 'ufo-tools-blocks' ), implode( ', ', (array) $type->ancestor ) ) );
		}

		foreach ( (array) ( $block['attrs'] ?? array() ) as $key => $value ) {
			$schema = $type->attributes[ $key ] ?? null;
			if ( null === $schema ) {
				/* translators: %s: nom de l'attribut */
				ufo_tools_blocks_check_report( $report, 'errors', $name, $path, sprintf( __( 'Attribut non déclaré : %s.', 'ufo-tools-blocks' ), $key ) );
				continue;
			}
			if ( ! ufo_tools_blocks_check_schema_supported( $schema ) ) {
				continue;
			}
			if ( ! ufo_tools_blocks_check_strict_type( $value, $schema ) ) {
				/* translators: 1: nom de l'attribut, 2: type attendu */
				ufo_tools_blocks_check_report( $report, 'errors', $name, $path, sprintf( __( '%1$s doit être de type %2$s (valeur JSON exacte, sans guillemets pour un nombre ou un booléen).', 'ufo-tools-blocks' ), $key, implode( ' ou ', (array) $schema['type'] ) ) );
				continue;
			}
			$valid = rest_validate_value_from_schema( $value, $schema, $key );
			if ( is_wp_error( $valid ) ) {
				ufo_tools_blocks_check_report( $report, 'errors', $name, $path, $valid->get_error_message() );
			}
		}

		$has_html = '' !== trim( $html );
		if ( in_array( $name, UFO_TOOLS_BLOCKS_ALWAYS_DYNAMIC, true ) ) {
			if ( $has_html ) {
				ufo_tools_blocks_check_report( $report, 'errors', $name, $path, __( 'HTML dans un bloc rendu par le serveur : n’écrire que le commentaire du bloc (attributs).', 'ufo-tools-blocks' ) );
			}
		} elseif ( in_array( $name, UFO_TOOLS_BLOCKS_FORMERLY_STATIC, true ) ) {
			if ( $has_html ) {
				ufo_tools_blocks_check_report( $report, 'warnings', $name, $path, __( 'Ancien format statique (≤ 1.0.8) : affiché tel quel et migré à la prochaine sauvegarde dans l’éditeur, mais valide seulement s’il reproduit exactement le HTML de l’époque. Pour un bloc nouveau ou modifié, n’écrire que le commentaire (attributs) et les blocs enfants.', 'ufo-tools-blocks' ) );
			}
		} elseif ( ! $type->is_dynamic() && 0 !== strpos( $name, 'core/' ) ) {
			ufo_tools_blocks_check_report( $report, 'warnings', $name, $path, __( 'Bloc statique d’une autre extension : son HTML doit être exactement celui de l’éditeur, à vérifier dans l’éditeur.', 'ufo-tools-blocks' ) );
		}

		$inner = (array) ( $block['innerBlocks'] ?? array() );
		if ( $inner ) {
			if ( count( $ancestors ) + 1 >= UFO_TOOLS_BLOCKS_CHECK_MAX_DEPTH ) {
				ufo_tools_blocks_check_report( $report, 'errors', $name, $path, __( 'Imbrication trop profonde.', 'ufo-tools-blocks' ) );
				continue;
			}
			ufo_tools_blocks_check_blocks( $inner, $name, array_merge( $ancestors, array( $name ) ), $path, $report );
		}
	}
}
