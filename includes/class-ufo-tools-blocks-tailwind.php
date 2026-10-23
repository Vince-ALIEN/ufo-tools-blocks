<?php
/**
 * Styles Tailwind précompilés des blocs (build/tailwind/blocks.css).
 *
 * Les blocs enregistrent des classes Tailwind CSS v4 : elles n'ont d'effet que
 * si une feuille de style les définit. Les thèmes Ufo compilent ces classes
 * eux-mêmes ; pour les autres thèmes, le plugin charge sa propre feuille. Le
 * choix se fait dans Réglages > Ufo Tools Blocks :
 *
 * - auto (par défaut) : chargée sauf si le thème fournit déjà Tailwind
 *   (add_theme_support( 'ufo-tools-blocks-tailwind' ), ou feuille de style du
 *   thème compilée par Tailwind CSS) ;
 * - on : toujours chargée ;
 * - off : jamais chargée.
 *
 * Le filtre ufo_tools_blocks_load_tailwind permet de forcer la décision.
 *
 * @package UfoToolsBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ufo_Tools_Blocks_Tailwind {

	const OPTION        = 'ufo_tools_blocks_tailwind';
	const HANDLE        = 'ufo-tools-blocks-tailwind';
	const PAGE          = 'ufo-tools-blocks';
	const MODES         = array( 'auto', 'on', 'off' );
	const THEME_SUPPORT = 'ufo-tools-blocks-tailwind';

	/** @var string Chemin du fichier principal du plugin. */
	private $plugin_file;

	public function __construct( $plugin_file ) {
		$this->plugin_file = $plugin_file;
	}

	public function register_hooks() {
		add_action( 'init', array( $this, 'register_style' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_style' ) );
		add_action( 'admin_init', array( $this, 'register_setting' ) );
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( $this->plugin_file ), array( $this, 'add_settings_link' ) );
	}

	public static function get_mode() {
		$mode = get_option( self::OPTION, 'auto' );
		return in_array( $mode, self::MODES, true ) ? $mode : 'auto';
	}

	/**
	 * Le thème actif (ou son parent) fournit-il déjà les classes Tailwind ?
	 */
	public static function theme_provides_tailwind() {
		if ( current_theme_supports( self::THEME_SUPPORT ) ) {
			return true;
		}

		// Tailwind CSS garde sa bannière « tailwindcss vX » en tête de la
		// feuille compilée, même minifiée.
		$stylesheets = array_unique(
			array(
				get_stylesheet_directory() . '/style.css',
				get_template_directory() . '/style.css',
			)
		);
		foreach ( $stylesheets as $stylesheet ) {
			if ( ! is_readable( $stylesheet ) ) {
				continue;
			}
			$head = file_get_contents( $stylesheet, false, null, 0, 8192 ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- fichier local.
			if ( false !== $head && false !== stripos( $head, 'tailwindcss v' ) ) {
				return true;
			}
		}

		return false;
	}

	public static function should_load() {
		$mode = self::get_mode();
		$load = 'on' === $mode || ( 'auto' === $mode && ! self::theme_provides_tailwind() );

		/**
		 * Charge ou non les styles Tailwind précompilés des blocs.
		 *
		 * @param bool   $load Décision issue du réglage.
		 * @param string $mode Réglage : auto, on ou off.
		 */
		return (bool) apply_filters( 'ufo_tools_blocks_load_tailwind', $load, $mode );
	}

	public function register_style() {
		$path = plugin_dir_path( $this->plugin_file ) . 'build/tailwind/blocks.css';
		if ( ! file_exists( $path ) ) {
			return;
		}
		wp_register_style(
			self::HANDLE,
			plugins_url( 'build/tailwind/blocks.css', $this->plugin_file ),
			array(),
			(string) filemtime( $path )
		);
	}

	/**
	 * Sur le site et dans l'éditeur (enqueue_block_assets couvre l'iframe).
	 */
	public function enqueue_style() {
		if ( wp_style_is( self::HANDLE, 'registered' ) && self::should_load() ) {
			wp_enqueue_style( self::HANDLE );
		}
	}

	public function register_setting() {
		register_setting(
			self::PAGE,
			self::OPTION,
			array(
				'type'              => 'string',
				'default'           => 'auto',
				'sanitize_callback' => array( __CLASS__, 'sanitize_mode' ),
			)
		);

		add_settings_section(
			'ufo_tools_blocks_styles',
			__( 'Styles des blocs', 'ufo-tools-blocks' ),
			array( $this, 'render_section' ),
			self::PAGE
		);

		add_settings_field(
			self::OPTION,
			__( 'Styles Tailwind CSS', 'ufo-tools-blocks' ),
			array( $this, 'render_field' ),
			self::PAGE,
			'ufo_tools_blocks_styles'
		);
	}

	public static function sanitize_mode( $value ) {
		return in_array( $value, self::MODES, true ) ? $value : 'auto';
	}

	public function add_settings_page() {
		add_options_page(
			__( 'Ufo Tools Blocks', 'ufo-tools-blocks' ),
			__( 'Ufo Tools Blocks', 'ufo-tools-blocks' ),
			'manage_options',
			self::PAGE,
			array( $this, 'render_page' )
		);
	}

	public function add_settings_link( $links ) {
		array_unshift(
			$links,
			sprintf(
				'<a href="%s">%s</a>',
				esc_url( admin_url( 'options-general.php?page=' . self::PAGE ) ),
				esc_html__( 'Réglages', 'ufo-tools-blocks' )
			)
		);
		return $links;
	}

	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::PAGE );
				do_settings_sections( self::PAGE );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	public function render_section() {
		echo '<p>' . esc_html__( 'Les blocs utilisent des classes Tailwind CSS. Si votre thème compile déjà Tailwind en incluant les classes de ce plugin, inutile de charger une seconde feuille de style.', 'ufo-tools-blocks' ) . '</p>';
	}

	public function render_field() {
		$mode    = self::get_mode();
		$choices = array(
			'auto' => __( 'Automatique : charger les styles du plugin sauf si le thème fournit déjà Tailwind CSS', 'ufo-tools-blocks' ),
			'on'   => __( 'Toujours charger les styles du plugin', 'ufo-tools-blocks' ),
			'off'  => __( 'Ne jamais charger les styles du plugin (le thème compile les classes)', 'ufo-tools-blocks' ),
		);
		echo '<fieldset>';
		foreach ( $choices as $value => $label ) {
			printf(
				'<label><input type="radio" name="%1$s" value="%2$s" %3$s> %4$s</label><br>',
				esc_attr( self::OPTION ),
				esc_attr( $value ),
				checked( $mode, $value, false ),
				esc_html( $label )
			);
		}
		echo '</fieldset>';

		printf(
			'<p class="description">%s</p>',
			esc_html(
				self::theme_provides_tailwind()
					? __( 'Thème actif : Tailwind CSS détecté.', 'ufo-tools-blocks' )
					: __( 'Thème actif : Tailwind CSS non détecté.', 'ufo-tools-blocks' )
			)
		);
		printf(
			'<p class="description">%s</p>',
			esc_html(
				self::should_load()
					? __( 'Les styles du plugin sont chargés.', 'ufo-tools-blocks' )
					: __( 'Les styles du plugin ne sont pas chargés.', 'ufo-tools-blocks' )
			)
		);
	}
}
