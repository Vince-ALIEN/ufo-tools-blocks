<?php
/**
 * FAQ : question d'un ufo-faq-item et schema FAQPage complet (avec
 * mainEntity) d'un ufo-faq, utilisés par leurs render.php.
 *
 * Jusqu'à la 1.0.8, ufo-faq était statique : save.js produisait un FAQPage
 * incomplet (sans mainEntity) qu'un filtre render_block remplaçait. Depuis la
 * 1.1.0, ufo-faq/render.php produit lui-même le schema et ignore l'ancien HTML
 * enregistré, donc aussi cet ancien schema.
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
 * Question d'un ufo-faq-item (HTML de RichText).
 *
 * Attribut du commentaire de bloc depuis la 1.1.0 ; avant, elle n'existait que
 * dans le HTML enregistré (<span class="faq-question">), relu ici tant que le
 * contenu n'a pas été réenregistré.
 *
 * @param array $item Bloc ufo-faq-item parsé (parse_blocks()).
 * @return string
 */
function ufo_tools_blocks_faq_question_html( $item ) {
	$question = $item['attrs']['question'] ?? '';
	if ( is_string( $question ) && '' !== $question ) {
		return $question;
	}

	$html = implode( '', array_filter( (array) ( $item['innerContent'] ?? array() ), 'is_string' ) );
	// La question est suivie de l'icône (<span aria-hidden="true">) dans tous
	// les formats enregistrés : la question peut contenir elle-même des <span>.
	if ( preg_match( '/<span class="faq-question">(.*?)<\/span><span aria-hidden="true"/s', $html, $q )
		|| preg_match( '/<span[^>]+class="[^"]*faq-question[^"]*"[^>]*>(.*?)<\/span>/s', $html, $q ) ) {
		return $q[1];
	}
	return '';
}

/**
 * Balise <script> JSON-LD FAQPage d'un bloc ufo-faq, vide si le schema est
 * désactivé ou si aucune question n'a de réponse.
 *
 * @param array $block Bloc ufo-faq parsé (parse_blocks()).
 * @return string
 */
function ufo_tools_blocks_faq_schema( $block ) {
	$attrs = isset( $block['attrs'] ) ? (array) $block['attrs'] : array();
	if ( ! ( $attrs['enableSchema'] ?? true ) ) {
		return '';
	}

	$main_entity = array();

	foreach ( isset( $block['innerBlocks'] ) ? (array) $block['innerBlocks'] : array() as $item ) {
		if ( 'ufo-blocks/ufo-faq-item' !== ( $item['blockName'] ?? '' ) ) {
			continue;
		}

		$question = ufo_tools_blocks_faq_plain_text( ufo_tools_blocks_faq_question_html( $item ) );

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
		return '';
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

	// JSON_HEX_TAG / JSON_HEX_AMP : < > & encodés en \u003C… pour qu'aucune
	// valeur (attributs du commentaire de bloc, non filtrés par kses) ne
	// puisse fermer la balise <script> (XSS stockée par un contributeur).
	return '<script type="application/ld+json">'
		. wp_json_encode( $json_ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP )
		. '</script>' . "\n";
}
