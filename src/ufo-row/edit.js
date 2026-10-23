import { __, sprintf } from "@wordpress/i18n";
import {
  InnerBlocks,
  useBlockProps,
  useInnerBlocksProps,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";
import { useState } from "@wordpress/element";
import Inspector from "./inspector";
import { getTailwindClasses, getBlockStyle } from "./shared";
import "./editor.css";

export default function Edit({ attributes, setAttributes, clientId, context }) {
  const { colSpan, rowSpan } = attributes;
  const gridColumns = context["ufo-blocks/columnsCount"] || 6;

  const { hasChildBlocks, gridClientId, position, siblingsCount } = useSelect(
    (select) => {
      const { getBlockOrder, getBlockRootClientId } = select(blockEditorStore);
      const rootId = getBlockRootClientId(clientId);
      const siblings = getBlockOrder(rootId);
      return {
        hasChildBlocks: getBlockOrder(clientId).length > 0,
        gridClientId: rootId,
        position: siblings.indexOf(clientId) + 1,
        siblingsCount: siblings.length,
      };
    },
    [clientId],
  );
  const { updateBlockAttributes, selectBlock } = useDispatch(blockEditorStore);

  // Comme core/column : aligner une cellule remet à zéro l'alignement de la grille.
  const setVerticalAlignment = (value) => {
    setAttributes({ verticalAlignment: value ?? "" });
    updateBlockAttributes(gridClientId, { verticalAlignment: undefined });
  };

  // State plutôt que ref : l'élément doit exister au rendu suivant.
  const [dropZoneElement, setDropZoneElement] = useState(null);
  const blockProps = useBlockProps({
    ref: setDropZoneElement,
    className: getTailwindClasses(attributes),
    style: getBlockStyle(attributes),
    "data-col-span": colSpan || "auto",
    "data-row-span": rowSpan || "auto",
  });

  const label = sprintf(
    /* translators: 1: libellé du bloc, 2: position de la cellule, 3: nombre de cellules */
    __("%1$s (%2$d sur %3$d)", "ufo-tools-blocks"),
    blockProps["aria-label"],
    position,
    siblingsCount,
  );

  const innerBlocksProps = useInnerBlocksProps(
    { ...blockProps, "aria-label": label },
    {
      // Permet de déposer un bloc avant ou après la cellule, pas seulement dedans.
      dropZoneElement,
      templateLock: false,
      renderAppender: hasChildBlocks ? undefined : InnerBlocks.ButtonBlockAppender,
    },
  );

  return (
    <>
      <Inspector
        attributes={attributes}
        setAttributes={setAttributes}
        gridColumns={gridColumns}
        setVerticalAlignment={setVerticalAlignment}
        onSelectGrid={() => selectBlock(gridClientId)}
      />
      <div {...innerBlocksProps} />
    </>
  );
}
