/**
 * « Lignes de hauteur égale » (equalRows) n'est pas activé sur une nouvelle
 * grille. block.json garde true par défaut : c'est le sens des grilles déjà
 * enregistrées sans l'attribut, qui ne doivent pas changer.
 */
import { createBlock } from '@wordpress/blocks';
import metadata from '../../src/ufo-grid/block.json';
import variations from '../../src/ufo-grid/variations';
import transforms from '../../src/ufo-grid/transforms';
import { registerBlocks, unregisterBlocks } from './support/register-blocks';

beforeAll( registerBlocks );
afterAll( unregisterBlocks );

describe( 'ufo-grid : equalRows', () => {
	test( 'block.json garde true par défaut (grilles déjà enregistrées)', () => {
		expect( metadata.attributes.equalRows.default ).toBe( true );
	} );

	test.each(
		variations
			.filter( ( { name } ) => name !== 'mosaic' )
			.map( ( { name } ) => name )
	)( 'disposition %s : equalRows false écrit explicitement', ( name ) => {
		const variation = variations.find( ( v ) => v.name === name );
		expect( variation.attributes.equalRows ).toBe( false );
	} );

	test( 'mosaïque : equalRows true (cellule sur deux lignes)', () => {
		const mosaic = variations.find( ( { name } ) => name === 'mosaic' );
		expect( mosaic.attributes.equalRows ).toBe( true );
	} );

	test( 'conversion depuis core/columns : equalRows false', () => {
		const { transform } = transforms.from.find( ( { blocks } ) =>
			blocks.includes( 'core/columns' )
		);
		const grid = transform( {}, [] );
		expect( grid.attributes.equalRows ).toBe( false );
	} );

	test( 'une grille sans l’attribut garde des lignes égales', () => {
		expect( createBlock( metadata.name ).attributes.equalRows ).toBe(
			true
		);
	} );
} );
