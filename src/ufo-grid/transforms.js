import { createBlock } from "@wordpress/blocks";

const GRID = "ufo-blocks/ufo-grid";
const ROW = "ufo-blocks/ufo-row";
const MAX_COLUMNS = 6;
const VERTICAL_ALIGNMENTS = ["top", "center", "bottom"];

// Attributs des supports communs à core/columns et ufo-grid.
const SHARED_ATTRIBUTES = [
  "anchor",
  "align",
  "className",
  "backgroundColor",
  "textColor",
  "gradient",
  "borderColor",
  "style",
];

function pickShared(attributes) {
  return Object.fromEntries(
    SHARED_ATTRIBUTES.filter((name) => attributes[name] !== undefined).map(
      (name) => [name, attributes[name]],
    ),
  );
}

function verticalAlignment(value) {
  return VERTICAL_ALIGNMENTS.includes(value) ? value : undefined;
}

function parseWidth(width) {
  if (Number.isFinite(width)) {
    return width;
  }
  if (typeof width === "string" && width.trim().endsWith("%")) {
    return parseFloat(width);
  }
  return undefined;
}

/**
 * Plus petite grille (≤ 6 colonnes) qui reproduit les largeurs en % des
 * colonnes core, à 6 points près. Sans largeurs : une colonne par cellule.
 */
export function fitGrid(widths) {
  const count = widths.length;
  const known = widths.filter((width) => width !== undefined);
  const equal = { columnsCount: Math.min(Math.max(count, 1), MAX_COLUMNS), spans: widths.map(() => 1) };

  if (!known.length || count > MAX_COLUMNS) {
    return equal;
  }

  const rest = Math.max(0, 100 - known.reduce((sum, width) => sum + width, 0));
  const missing = count - known.length;
  const filled = widths.map((width) => width ?? (missing ? rest / missing : 0));

  for (let columns = count; columns <= MAX_COLUMNS; columns++) {
    const spans = filled.map((width) => Math.round((width * columns) / 100));
    const fits =
      spans.every((span) => span >= 1) &&
      spans.reduce((sum, span) => sum + span, 0) === columns &&
      filled.every((width, index) => Math.abs((spans[index] * 100) / columns - width) <= 6);
    if (fits) {
      return { columnsCount: columns, spans };
    }
  }
  return equal;
}

const transforms = {
  from: [
    {
      type: "block",
      blocks: ["core/columns"],
      transform: (attributes, innerBlocks) => {
        const { columnsCount, spans } = fitGrid(
          innerBlocks.map((column) => parseWidth(column.attributes.width)),
        );
        return createBlock(
          GRID,
          {
            ...pickShared(attributes),
            columnsCount,
            verticalAlignment: verticalAlignment(attributes.verticalAlignment),
          },
          innerBlocks.map((column, index) =>
            createBlock(
              ROW,
              {
                ...pickShared(column.attributes),
                colSpan: spans[index] > 1 ? String(spans[index]) : "",
                verticalAlignment: verticalAlignment(column.attributes.verticalAlignment) ?? "",
              },
              column.innerBlocks,
            ),
          ),
        );
      },
    },
  ],
  to: [
    {
      type: "block",
      blocks: ["core/columns"],
      transform: (attributes, innerBlocks) => {
        const columns = attributes.columnsCount || 1;
        const hasSpans = innerBlocks.some(
          (block) => block.name === ROW && block.attributes.colSpan,
        );
        return createBlock(
          "core/columns",
          {
            ...pickShared(attributes),
            verticalAlignment: attributes.verticalAlignment,
          },
          innerBlocks.map((block) => {
            if (block.name !== ROW) {
              return createBlock("core/column", {}, [block]);
            }
            const span = Math.min(parseInt(block.attributes.colSpan, 10) || 1, columns);
            return createBlock(
              "core/column",
              {
                ...pickShared(block.attributes),
                width: hasSpans ? `${+((span * 100) / columns).toFixed(2)}%` : undefined,
                verticalAlignment: block.attributes.verticalAlignment || undefined,
              },
              block.innerBlocks,
            );
          }),
        );
      },
    },
  ],
};

export default transforms;
