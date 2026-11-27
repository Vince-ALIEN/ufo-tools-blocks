<?php
/**
 * Classes Tailwind des blocs rendus côté serveur.
 *
 * Portage PHP des fonctions de src/ufo-grid/shared.js, src/ufo-row/shared.js
 * et de l'alignement de ufo-buttons-group : l'éditeur (JS) et le site (PHP)
 * doivent produire exactement les mêmes classes. tests/js/classes-php.test.js
 * compare les deux sorties sur toutes les valeurs de l'inspecteur : modifier
 * les deux côtés ensemble.
 *
 * Fonctions pures, sans WordPress (testables avec php seul).
 *
 * @package ufo-tools-blocks
 */

defined( 'ABSPATH' ) || exit;

/**
 * Valeur « vraie » au sens de JavaScript : '0' est vrai (contrairement à PHP),
 * '', 0, null et false sont faux.
 *
 * @param mixed $value Valeur d'attribut.
 * @return bool
 */
function ufo_tools_blocks_truthy( $value ) {
	return ! ( null === $value || false === $value || '' === $value || 0 === $value || 0.0 === $value );
}

/**
 * Valeur d'attribut convertie en texte comme dans un template literal JS.
 *
 * @param mixed $value Valeur d'attribut (chaîne ou nombre).
 * @return string
 */
function ufo_tools_blocks_class_value( $value ) {
	if ( is_bool( $value ) ) {
		return $value ? 'true' : 'false';
	}
	return is_scalar( $value ) ? (string) $value : '';
}

/**
 * Liste de classes : valeurs fausses retirées, séparées par une espace.
 *
 * @param array $classes Classes (ou false).
 * @return string
 */
function ufo_tools_blocks_class_list( array $classes ) {
	return implode( ' ', array_filter( $classes, 'ufo_tools_blocks_truthy' ) );
}

/**
 * L'attribut existe (équivalent de `!== undefined`).
 *
 * @param array  $attributes Attributs du bloc.
 * @param string $key        Nom de l'attribut.
 * @return bool
 */
function ufo_tools_blocks_has( array $attributes, $key ) {
	return array_key_exists( $key, $attributes ) && null !== $attributes[ $key ];
}

/**
 * URL d'une image ou vidéo de fond (attribut objet { url, id }).
 *
 * @param mixed $media Attribut backgroundImage / backgroundVideo.
 * @return string
 */
function ufo_tools_blocks_media_url( $media ) {
	return is_array( $media ) && isset( $media['url'] ) && is_string( $media['url'] ) ? $media['url'] : '';
}

/**
 * Point de rupture de la grille (breakpointOf de src/shared/breakpoint.js) :
 * none, sm, md, lg ou xl, md pour toute autre valeur.
 *
 * @param mixed $value Attribut breakpoint de ufo-grid, ou contexte de ufo-row.
 * @return string
 */
function ufo_tools_blocks_breakpoint( $value ) {
	return in_array( $value, array( 'none', 'sm', 'md', 'lg', 'xl' ), true ) ? $value : 'md';
}

/**
 * Classe active à partir du point de rupture (at() de src/shared/breakpoint.js).
 *
 * @param string $breakpoint Résultat de ufo_tools_blocks_breakpoint().
 * @param string $class_name Classe sans préfixe.
 * @return string lg:grid-cols-2, ou grid-cols-2 pour none.
 */
function ufo_tools_blocks_at( $breakpoint, $class_name ) {
	return 'none' === $breakpoint ? $class_name : $breakpoint . ':' . $class_name;
}

/**
 * ufo-grid : classes de l'enveloppe (getWrapperClasses).
 *
 * @param array $attributes Attributs du bloc.
 * @return string
 */
function ufo_tools_blocks_grid_wrapper_classes( array $attributes ) {
	$min_height = $attributes['minHeight'] ?? null;
	$radius     = $attributes['borderRadius'] ?? null;
	$bp         = ufo_tools_blocks_breakpoint( $attributes['breakpoint'] ?? null );

	if ( 'screen' === $min_height ) {
		$height = 'none' === $bp ? 'h-screen' : $bp . ':h-screen h-full';
	} else {
		$height = 'h-full' === $min_height ? 'h-full' : false;
	}

	return ufo_tools_blocks_class_list(
		array(
			'relative',
			'ufo-grid-wrapper',
			$height,
			ufo_tools_blocks_truthy( $radius ) ? 'rounded-' . ufo_tools_blocks_class_value( $radius ) : false,
			'' !== ufo_tools_blocks_media_url( $attributes['backgroundImage'] ?? null ) ? 'bg-no-repeat' : false,
			ufo_tools_blocks_has( $attributes, 'paddingX' ) ? 'px-' . ufo_tools_blocks_class_value( $attributes['paddingX'] ) : false,
			ufo_tools_blocks_has( $attributes, 'paddingY' ) ? 'py-' . ufo_tools_blocks_class_value( $attributes['paddingY'] ) : false,
		)
	);
}

/**
 * ufo-grid : classes de la grille intérieure (getInnerClasses).
 *
 * @param array $attributes Attributs du bloc.
 * @return string
 */
function ufo_tools_blocks_grid_inner_classes( array $attributes ) {
	$alignments = array(
		'top'    => 'items-start',
		'center' => 'items-center',
		'bottom' => 'items-end',
	);
	$heights    = array(
		'h-full' => 'h-full',
	);

	$reverse    = ufo_tools_blocks_truthy( $attributes['reverseMobile'] ?? null );
	$rows       = $attributes['rowsCount'] ?? null;
	$alignment  = $attributes['verticalAlignment'] ?? null;
	$min_height = $attributes['minHeight'] ?? null;
	$bp         = ufo_tools_blocks_breakpoint( $attributes['breakpoint'] ?? null );
	$always     = 'none' === $bp;
	$reverse    = $reverse && ! $always;
	$equal_rows = ufo_tools_blocks_truthy( $attributes['equalRows'] ?? null );
	$columns    = ufo_tools_blocks_has( $attributes, 'columnsCount' );

	if ( 'screen' === $min_height ) {
		$height = 'h-full';
	} elseif ( is_string( $min_height ) && isset( $heights[ $min_height ] ) ) {
		$height = $heights[ $min_height ];
	} else {
		$height = ufo_tools_blocks_truthy( $min_height ) ? 'h-' . ufo_tools_blocks_class_value( $min_height ) : false;
	}

	return ufo_tools_blocks_class_list(
		array(
			$reverse ? ufo_tools_blocks_at( $bp, 'grid' ) : 'grid',
			$always && $columns ? false : 'grid-cols-1',
			$equal_rows ? ufo_tools_blocks_at( $bp, 'auto-rows-fr' ) : false,
			$always && $equal_rows ? false : 'auto-rows-auto',
			ufo_tools_blocks_has( $attributes, 'gap' ) ? 'gap-' . ufo_tools_blocks_class_value( $attributes['gap'] ) : false,
			$columns ? ufo_tools_blocks_at( $bp, 'grid-cols-' . ufo_tools_blocks_class_value( $attributes['columnsCount'] ) ) : false,
			ufo_tools_blocks_truthy( $rows ) ? 'grid-rows-' . ufo_tools_blocks_class_value( $rows ) : false,
			is_string( $alignment ) && isset( $alignments[ $alignment ] ) ? $alignments[ $alignment ] : false,
			$reverse ? 'flex flex-col-reverse' : false,
			$height,
			ufo_tools_blocks_truthy( $attributes['isBoxed'] ?? null ) ? 'max-w-content mx-auto w-full' : false,
		)
	);
}

/**
 * Marge haute de ufo-row et core/image (marginTopClass de
 * src/ufo-row/shared.js), à toutes les largeurs : mt-N, ou -mt-N (décalage
 * vers le haut) pour une valeur négative.
 *
 * @param mixed $value Attribut marge haute ("-16" … "16", pairs).
 * @return string Classe, ou chaîne vide sans marge.
 */
function ufo_tools_blocks_margin_top_class( $value ) {
	$amount = is_scalar( $value ) ? (int) $value : 0;
	if ( 0 === $amount ) {
		return '';
	}
	return $amount > 0 ? 'mt-' . $amount : '-mt-' . ( -$amount );
}

/**
 * ufo-row : classes de la cellule (getTailwindClasses).
 *
 * @param array $attributes Attributs du bloc.
 * @param mixed $breakpoint Point de rupture de la grille parente (contexte
 *                          ufo-blocks/breakpoint), md par défaut.
 * @return string
 */
function ufo_tools_blocks_row_classes( array $attributes, $breakpoint = null ) {
	$bp         = ufo_tools_blocks_breakpoint( $breakpoint );
	$alignments = array(
		'top'    => 'flex flex-col justify-start',
		'center' => 'flex flex-col justify-center',
		'bottom' => 'flex flex-col justify-end',
	);
	$heights    = array(
		'screen' => 'h-screen',
		'full'   => 'h-full',
	);
	$prefixed   = array(
		'colSpan'      => ufo_tools_blocks_at( $bp, 'col-span-' ),
		'colStart'     => ufo_tools_blocks_at( $bp, 'col-start-' ),
		'colEnd'       => ufo_tools_blocks_at( $bp, 'col-end-' ),
		'rowSpan'      => 'row-span-',
		'rowStart'     => 'row-start-',
		'rowEnd'       => 'row-end-',
		'height'       => 'h-',
		'minHeight'    => null,
		'borderRadius' => 'rounded-',
		'paddingX'     => 'px-',
		'paddingY'     => 'py-',
	);

	$classes = array( 'ufo-row' );
	foreach ( $prefixed as $key => $prefix ) {
		$value = $attributes[ $key ] ?? null;
		if ( 'minHeight' === $key ) {
			if ( is_string( $value ) && isset( $heights[ $value ] ) ) {
				$classes[] = $heights[ $value ];
			} elseif ( ufo_tools_blocks_truthy( $value ) ) {
				$classes[] = 'h-' . ufo_tools_blocks_class_value( $value );
			}
			continue;
		}
		if ( ufo_tools_blocks_truthy( $value ) ) {
			$classes[] = $prefix . ufo_tools_blocks_class_value( $value );
		}
	}

	$margin_top = ufo_tools_blocks_margin_top_class( $attributes['marginTop'] ?? null );
	if ( '' !== $margin_top ) {
		$classes[] = $margin_top;
	}

	$alignment = $attributes['verticalAlignment'] ?? null;
	if ( is_string( $alignment ) && isset( $alignments[ $alignment ] ) ) {
		$classes[] = $alignments[ $alignment ];
	}
	if ( '' !== ufo_tools_blocks_media_url( $attributes['backgroundImage'] ?? null ) ) {
		$classes[] = 'bg-no-repeat';
	}

	return ufo_tools_blocks_class_list( $classes );
}

/**
 * ufo-buttons-group : classes du conteneur flex.
 *
 * Colonne en mobile (alignement via items-*), ligne à partir de lg (via
 * justify-*).
 *
 * @param array $attributes Attributs du bloc.
 * @return string
 */
function ufo_tools_blocks_buttons_group_classes( array $attributes ) {
	$alignments = array(
		'left'   => 'items-start lg:justify-start',
		'center' => 'items-center lg:justify-center',
	);
	$alignment  = $attributes['buttonAlignment'] ?? null;

	return 'flex flex-col lg:flex-row lg:flex-nowrap lg:items-stretch p-4 gap-2 '
		. ( is_string( $alignment ) && isset( $alignments[ $alignment ] ) ? $alignments[ $alignment ] : 'items-end lg:justify-end' );
}
