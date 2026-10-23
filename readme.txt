=== Ufo Tools Blocks ===
Tags: blocks, grid, layout, faq, tailwind
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Grid, FAQ, button, title and icon blocks styled with Tailwind CSS classes, with an editor experience modelled on the core blocks.

== Description ==

Ufo Tools Blocks adds a set of layout and content blocks to the block editor. The blocks output Tailwind CSS v4 utility classes, so they follow your theme's design tokens when your theme runs Tailwind, and they work out of the box with any other theme thanks to a small precompiled stylesheet.

**Blocks**

* **ufo Grid** and **ufo Row**: a responsive CSS grid (1 to 6 columns) whose cells can span several columns and rows. Start from a layout (50/50, 33/66, 25/50/25, mosaic…), add cells from the toolbar, transform from and to the core Columns block.
* **ufo FAQ** and **ufo FAQ Item**: accessible accordion with FAQPage structured data (schema.org).
* **ufo Button** and **ufo Buttons Group**: links styled as buttons, with icons and screen-reader text.
* **ufo Title**: heading with an icon on a rounded background.
* **ufo Icon**: an icon from the bundled Lucide set, in a theme color.

**Tailwind CSS stylesheet**

Go to *Settings > Ufo Tools Blocks* to choose when the plugin loads its precompiled Tailwind CSS stylesheet (about 3 KB gzipped, utilities used by the blocks only, no reset):

* *Automatic* (default): loaded unless the active theme already compiles Tailwind CSS.
* *Always* or *Never*.

The stylesheet is served from your site. The plugin loads nothing from a third-party service.

**Source code**

The JavaScript and CSS shipped in `build/` are compiled. The uncompiled source code and build tools are available at [github.com/Vince-ALIEN/ufo-tools-blocks](https://github.com/Vince-ALIEN/ufo-tools-blocks): run `npm install` then `npm run build`.

== Installation ==

1. Install the plugin from *Plugins > Add New*, or upload the plugin folder to `/wp-content/plugins/`.
2. Activate it.
3. Insert the blocks from the « UFO Blocks » category of the block inserter.
4. Optional: check *Settings > Ufo Tools Blocks* if your theme already uses Tailwind CSS.

== Frequently Asked Questions ==

= My theme uses Tailwind CSS. Do I need the plugin stylesheet? =

No. Add the plugin sources to your Tailwind build so the block classes are generated, then set *Settings > Ufo Tools Blocks* to *Never* (or declare `add_theme_support( 'ufo-tools-blocks-tailwind' );` in your theme). The README on GitHub lists the `@source` directives to add.

= How is a Tailwind theme detected in Automatic mode? =

The plugin stylesheet is not loaded when the theme declares `add_theme_support( 'ufo-tools-blocks-tailwind' )`, or when the `style.css` of the theme (or its parent) was compiled by Tailwind CSS. The `ufo_tools_blocks_load_tailwind` filter can force the decision.

= Are the colors taken from my theme? =

Yes. Classes such as `text-primary` use the `primary` color of your `theme.json` palette, and the boxed grid width uses your theme's content width.

== Screenshots ==

1. Choosing a layout when inserting a grid.
2. Grid settings.

== Changelog ==

= 1.0.0 =
* First release on WordPress.org.
* Grid and row editor rebuilt on the model of the core Columns block: layout picker, settings panels with reset, transforms with core Columns.
* Optional precompiled Tailwind CSS stylesheet (Settings > Ufo Tools Blocks).

== Upgrade Notice ==

= 1.0.0 =
First release on WordPress.org.

== Third-party resources ==

* [Tailwind CSS](https://tailwindcss.com/) v4, MIT License: the precompiled stylesheet `build/tailwind/blocks.css` is generated with it.
* [Lucide](https://lucide.dev/) icons, ISC License: block icons and the icons offered by the button, title and icon blocks.
