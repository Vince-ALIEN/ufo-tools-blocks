/**
 * Comportement front de ufo-tabs (src/ufo-tabs/view.js) sur le balisage
 * produit par render.php.
 */
const markup = ( count ) => `
<div data-ufo-tabs>
  <div><div role="tablist">
    ${ Array.from(
		{ length: count },
		( _, i ) => `
      <button type="button" role="tab" id="t-tab-${ i + 1 }" aria-controls="t-panel-${ i + 1 }"
        aria-selected="${ i === 0 }" tabindex="${ i === 0 ? 0 : -1 }">Tab ${ i + 1 }</button>`
	).join( '' ) }
  </div></div>
  <div>
    ${ Array.from(
		{ length: count },
		( _, i ) => `
      <div id="t-panel-${ i + 1 }" role="tabpanel" ${ i === 0 ? '' : 'hidden' }>
        <p id="anchor-${ i + 1 }">Panel ${ i + 1 }</p>
      </div>`
	).join( '' ) }
  </div>
</div>`;

const load = () => {
	jest.isolateModules( () => require( '../../src/ufo-tabs/view.js' ) );
};

const tabs = () => Array.from( document.querySelectorAll( '[role="tab"]' ) );
const state = () =>
	tabs().map( ( tab ) => ( {
		selected: tab.getAttribute( 'aria-selected' ),
		tabIndex: tab.tabIndex,
		hidden: document.getElementById( tab.getAttribute( 'aria-controls' ) )
			.hidden,
	} ) );
const isOpen = ( index ) => {
	const s = state();
	return s.every( ( t, i ) =>
		i === index
			? t.selected === 'true' && t.tabIndex === 0 && ! t.hidden
			: t.selected === 'false' && t.tabIndex === -1 && t.hidden
	);
};
const key = ( k ) =>
	document.activeElement.dispatchEvent(
		new KeyboardEvent( 'keydown', { key: k, bubbles: true } )
	);

beforeEach( () => {
	window.history.replaceState( null, '', '/' );
	document.body.innerHTML = markup( 3 );
} );

test( "clic : ouvre l'onglet et ferme les autres", () => {
	load();
	tabs()[ 1 ].click();
	expect( isOpen( 1 ) ).toBe( true );
} );

test( 'clavier : flèches (en boucle), Début, Fin', () => {
	load();
	tabs()[ 0 ].focus();
	key( 'ArrowRight' );
	expect( isOpen( 1 ) ).toBe( true );
	expect( document.activeElement ).toBe( tabs()[ 1 ] );
	key( 'End' );
	expect( isOpen( 2 ) ).toBe( true );
	key( 'ArrowRight' );
	expect( isOpen( 0 ) ).toBe( true );
	key( 'ArrowLeft' );
	expect( isOpen( 2 ) ).toBe( true );
	key( 'Home' );
	expect( isOpen( 0 ) ).toBe( true );
} );

test( "ancre de l'URL : ouvre l'onglet qui contient la cible", () => {
	window.history.replaceState( null, '', '/#anchor-3' );
	load();
	expect( isOpen( 2 ) ).toBe( true );
} );
