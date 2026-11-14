<?php
/**
 * Génère le schema FAQPage complet (avec mainEntity) pour le bloc ufo-faq.
 *
 * save.js ne peut pas accéder aux données des inner blocks, donc il produit
 * un FAQPage sans mainEntity. Ce filtre intercepte le rendu, retire ce schema
 * incomplet, extrait les questions/réponses depuis les inner blocks, puis
 * injecte le schema complet.
 *
 * @package ufo-tools-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * HTML statique d'un bloc et de tous ses descendants, dans l'ordre du document.
 *
 * innerContent alterne des chaînes (HTML du bloc) et des null, un par inner
 * block, à remplacer par le rendu de cet inner block : on les parcourt
 * récursivement pour ne rien perdre d'une réponse imbriquée (groupe, liste…).
 *
 * @param array $block Bloc parsé (parse_blocks()).
 * @return string
 */
function ufo_tools_blocks_faq_block_html( $block ) {
	$html        = '';
	$inner_index = 0;
	$inner       = isset( $block['innerBlocks'] ) ? (array) $block['innerBlocks'] : array();

	foreach ( isset( $block['innerContent'] ) ? (array) $block['innerContent'] : array() as $chunk ) {
		if ( is_string( $chunk ) ) {
			$html .= $chunk;
		} elseif ( isset( $inner[ $inner_index ] ) ) {
			$html .= ufo_tools_blocks_faq_block_html( $inner[ $inner_index ] );
			++$inner_index;
		}
	}

	return $html;
}

/**
 * Texte brut d'un fragment HTML pour le JSON-LD : balises retirées (avec un
 * espace pour ne pas coller deux paragraphes), entités décodées (&amp; → &),
 * espaces normalisés.
 *
 * @param string $html Fragment HTML.
 * @return string
 */
function ufo_tools_blocks_faq_plain_text( $html ) {
	$text = wp_strip_all_tags( str_replace( '<', ' <', (string) $html ) );
	$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

	return trim( preg_replace( '/\s+/u', ' ', $text ) );
}

/**
 * Filtre render_block du bloc ufo-faq.
 *
 * @param string $block_content HTML rendu du bloc.
 * @param array  $block         Bloc parsé.
 * @return string
 */
function ufo_tools_blocks_faq_render_schema( $block_content, $block ) {
	if ( 'ufo-blocks/ufo-faq' !== $block['blockName'] ) {
		return $block_content;
	}

	// Toujours retirer le schema incomplet produit par save.js : sans
	// mainEntity, un FAQPage est invalide pour les moteurs de recherche.
	$block_content = preg_replace(
		'/<script\s+type="application\/ld\+json">.*?<\/script>\s*/s',
		'',
		$block_content,
		1
	);

	$attrs = isset( $block['attrs'] ) ? (array) $block['attrs'] : array();
	if ( ! ( $attrs['enableSchema'] ?? true ) ) {
		return $block_content;
	}

	$main_entity = array();

	foreach ( isset( $block['innerBlocks'] ) ? (array) $block['innerBlocks'] : array() as $item ) {
		if ( 'ufo-blocks/ufo-faq-item' !== ( $item['blockName'] ?? '' ) ) {
			continue;
		}

		// Question : stockée dans le HTML du bloc (source "html", .faq-question).
		$item_html = implode( '', array_filter( (array) $item['innerContent'], 'is_string' ) );
		preg_match( '/<span[^>]+class="[^"]*faq-question[^"]*"[^>]*>(.*?)<\/span>/s', $item_html, $q );
		$question = isset( $q[1] ) ? ufo_tools_blocks_faq_plain_text( $q[1] ) : '';

		// Réponse : HTML de tous les inner blocks, à toute profondeur.
		$answer_html = '';
		foreach ( isset( $item['innerBlocks'] ) ? (array) $item['innerBlocks'] : array() as $answer_block ) {
			$answer_html .= ' ' . ufo_tools_blocks_faq_block_html( $answer_block );
		}
		$answer = ufo_tools_blocks_faq_plain_text( $answer_html );

		if ( '' === $question || '' === $answer ) {
			continue;
		}

		$main_entity[] = array(
			'@type'          => 'Question',
			'name'           => $question,
			'acceptedAnswer' => array(
				'@type' => 'Answer',
				'text'  => $answer,
			),
		);
	}

	if ( empty( $main_entity ) ) {
		return $block_content;
	}

	$json_ld = array(
		'@context'   => 'https://schema.org',
		'@type'      => 'FAQPage',
		'mainEntity' => $main_entity,
	);

	$optional = array(
		'schemaName'        => 'name',
		'schemaDescription' => 'description',
		'schemaAbout'       => 'about',
	);
	foreach ( $optional as $attr => $key ) {
		$value = sanitize_text_field( (string) ( $attrs[ $attr ] ?? '' ) );
		if ( '' !== $value ) {
			$json_ld[ $key ] = $value;
		}
	}

	// JSON_HEX_TAG / JSON_HEX_AMP : < > & encodés en <… pour qu'aucune
	// valeur (attributs du commentaire de bloc, non filtrés par kses) ne
	// puisse fermer la balise <script> (XSS stockée par un contributeur).
	$schema_tag = '<script type="application/ld+json">'
		. wp_json_encode( $json_ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP )
		. '</script>' . "\n";

	return $schema_tag . $block_content;
}
add_filter( 'render_block', 'ufo_tools_blocks_faq_render_schema', 10, 2 );
