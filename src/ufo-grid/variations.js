import { __ } from "@wordpress/i18n";
import { SVG, Rect } from "@wordpress/components";

const ROW = "ufo-blocks/ufo-row";

/**
 * Icône 48×48 d'une disposition : chaque cellule est [x, y, largeur, hauteur]
 * en unités de grille.
 */
function layoutIcon(columns, rows, cells) {
  const gap = 2;
  const unitX = (48 + gap) / columns;
  const unitY = (32 + gap) / rows;
  return (
    <SVG xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      {cells.map(([x, y, w, h], index) => (
        <Rect
          key={index}
          x={x * unitX}
          y={8 + y * unitY}
          width={w * unitX - gap}
          height={h * unitY - gap}
          rx="2"
        />
      ))}
    </SVG>
  );
}

function rows(count, attributes = {}) {
  return Array.from({ length: count }, () => [ROW, attributes]);
}

/**
 * Dispositions proposées à l'insertion de la grille, sur le modèle des
 * variations de core/columns, plus une mosaïque propre à la grille.
 */
const variations = [
  {
    name: "one-column",
    title: __("100", "ufo-tools-blocks"),
    description: __("Une colonne", "ufo-tools-blocks"),
    icon: layoutIcon(1, 1, [[0, 0, 1, 1]]),
    attributes: { columnsCount: 1 },
    innerBlocks: rows(1),
    scope: ["block"],
  },
  {
    name: "two-columns-equal",
    title: __("50 / 50", "ufo-tools-blocks"),
    description: __("Deux colonnes égales", "ufo-tools-blocks"),
    icon: layoutIcon(2, 1, [[0, 0, 1, 1], [1, 0, 1, 1]]),
    isDefault: true,
    attributes: { columnsCount: 2 },
    innerBlocks: rows(2),
    scope: ["block"],
  },
  {
    name: "two-columns-one-third-two-thirds",
    title: __("33 / 66", "ufo-tools-blocks"),
    description: __("Deux colonnes : un tiers, deux tiers", "ufo-tools-blocks"),
    icon: layoutIcon(3, 1, [[0, 0, 1, 1], [1, 0, 2, 1]]),
    attributes: { columnsCount: 3 },
    innerBlocks: [[ROW], [ROW, { colSpan: "2" }]],
    scope: ["block"],
  },
  {
    name: "two-columns-two-thirds-one-third",
    title: __("66 / 33", "ufo-tools-blocks"),
    description: __("Deux colonnes : deux tiers, un tiers", "ufo-tools-blocks"),
    icon: layoutIcon(3, 1, [[0, 0, 2, 1], [2, 0, 1, 1]]),
    attributes: { columnsCount: 3 },
    innerBlocks: [[ROW, { colSpan: "2" }], [ROW]],
    scope: ["block"],
  },
  {
    name: "three-columns-equal",
    title: __("33 / 33 / 33", "ufo-tools-blocks"),
    description: __("Trois colonnes égales", "ufo-tools-blocks"),
    icon: layoutIcon(3, 1, [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1]]),
    attributes: { columnsCount: 3 },
    innerBlocks: rows(3),
    scope: ["block"],
  },
  {
    name: "three-columns-wider-center",
    title: __("25 / 50 / 25", "ufo-tools-blocks"),
    description: __("Trois colonnes, centrale plus large", "ufo-tools-blocks"),
    icon: layoutIcon(4, 1, [[0, 0, 1, 1], [1, 0, 2, 1], [3, 0, 1, 1]]),
    attributes: { columnsCount: 4 },
    innerBlocks: [[ROW], [ROW, { colSpan: "2" }], [ROW]],
    scope: ["block"],
  },
  {
    name: "four-columns-equal",
    title: __("25 / 25 / 25 / 25", "ufo-tools-blocks"),
    description: __("Quatre colonnes égales", "ufo-tools-blocks"),
    icon: layoutIcon(4, 1, [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1], [3, 0, 1, 1]]),
    attributes: { columnsCount: 4 },
    innerBlocks: rows(4),
    scope: ["block"],
  },
  {
    name: "mosaic",
    title: __("Mosaïque", "ufo-tools-blocks"),
    description: __("Une grande cellule sur deux lignes et deux petites", "ufo-tools-blocks"),
    icon: layoutIcon(3, 2, [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1]]),
    attributes: { columnsCount: 3, equalRows: true },
    innerBlocks: [[ROW, { colSpan: "2", rowSpan: "2" }], [ROW], [ROW]],
    scope: ["block"],
  },
];

export default variations;
