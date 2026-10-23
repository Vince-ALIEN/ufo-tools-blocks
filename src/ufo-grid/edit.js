import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  useInnerBlocksProps,
  BlockControls,
  __experimentalBlockVariationPicker as BlockVariationPicker,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import {
  createBlock,
  createBlocksFromInnerBlocksTemplate,
  store as blocksStore,
} from "@wordpress/blocks";
import { useDispatch, useSelect, useRegistry } from "@wordpress/data";
import { plus } from "@wordpress/icons";
import Inspector from "./inspector";
import {
  getWrapperClasses,
  getInnerClasses,
  getWrapperStyle,
} from "./shared";
import "./editor.css";

const ROW = "ufo-blocks/ufo-row";
const DEFAULT_BLOCK = { name: ROW };

function GridEditContainer({ attributes, setAttributes, clientId }) {
  const { columnsCount, gap, backgroundVideo } = attributes;
  const registry = useRegistry();
  const { getBlocks } = useSelect(blockEditorStore);
  const { insertBlocks, updateBlockAttributes, selectBlock } =
    useDispatch(blockEditorStore);

  const blockProps = useBlockProps({
    className: getWrapperClasses(attributes),
    // Variables lues uniquement par editor.css (guides de colonnes).
    style: {
      ...getWrapperStyle(attributes),
      "--ufo-cols": columnsCount,
      "--ufo-gap": gap,
    },
    "data-cols": columnsCount,
    "data-gap": gap,
  });

  const innerBlocksProps = useInnerBlocksProps(
    { className: getInnerClasses(attributes) },
    {
      allowedBlocks: [ROW, "core/image"],
      defaultBlock: DEFAULT_BLOCK,
      directInsert: true,
      orientation: "horizontal",
      // Un bouton « + » dans la grille y occuperait une cellule : les
      // cellules s'ajoutent depuis la barre d'outils, comme pour core/columns.
      renderAppender: false,
      templateLock: false,
    },
  );

  const addRows = (count) => {
    if (count > 0) {
      insertBlocks(
        Array.from({ length: count }, () => createBlock(ROW)),
        undefined,
        clientId,
        false,
      );
    }
  };

  /**
   * Comme pour core/columns : augmenter le nombre de colonnes ajoute des
   * cellules tant que la première ligne n'est pas remplie. Le réduire ne
   * supprime rien, les cellules passent à la ligne.
   */
  const setColumnsCount = (nextCount) => {
    registry.batch(() => {
      setAttributes({ columnsCount: nextCount });
      addRows(nextCount - getBlocks(clientId).length);
    });
  };

  /**
   * L'alignement vertical de la grille s'applique aussi aux cellules ; une
   * cellule alignée séparément le remet à zéro sur la grille (voir ufo-row).
   */
  const setVerticalAlignment = (value) => {
    const rowIds = getBlocks(clientId)
      .filter((block) => block.name === ROW)
      .map((block) => block.clientId);
    registry.batch(() => {
      setAttributes({ verticalAlignment: value });
      updateBlockAttributes(rowIds, { verticalAlignment: value ?? "" });
    });
  };

  return (
    <>
      <Inspector
        attributes={attributes}
        setAttributes={setAttributes}
        setColumnsCount={setColumnsCount}
        setVerticalAlignment={setVerticalAlignment}
      />
      <BlockControls group="other">
        <ToolbarGroup>
          <ToolbarButton
            icon={plus}
            label={__("Ajouter une cellule", "ufo-tools-blocks")}
            onClick={() => addRows(1)}
          />
        </ToolbarGroup>
      </BlockControls>
      <div {...blockProps}>
        {/* Éditeur seulement : badge cliquable qui resélectionne la grille,
            souvent impossible à atteindre au clic quand les cellules la
            remplissent entièrement. */}
        <button
          type="button"
          className="ufo-grid__badge"
          onClick={() => selectBlock(clientId)}
          aria-label={__("Sélectionner la grille", "ufo-tools-blocks")}
        >
          {`${__("Grille", "ufo-tools-blocks")} ${columnsCount} col · gap ${gap}`}
        </button>
        {backgroundVideo?.url && (
          <video
            className="absolute inset-0 w-full h-full object-cover -z-10"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={backgroundVideo.url} type="video/mp4" />
          </video>
        )}
        <div {...innerBlocksProps} />
      </div>
    </>
  );
}

function Placeholder({ clientId, name, setAttributes }) {
  const { blockType, variations } = useSelect(
    (select) => {
      const { getBlockVariations, getBlockType } = select(blocksStore);
      return {
        blockType: getBlockType(name),
        variations: getBlockVariations(name, "block"),
      };
    },
    [name],
  );
  const { replaceInnerBlocks } = useDispatch(blockEditorStore);
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <BlockVariationPicker
        icon={blockType?.icon?.src}
        label={blockType?.title}
        variations={variations}
        instructions={__("Choisissez une disposition de départ :", "ufo-tools-blocks")}
        onSelect={(variation) => {
          if (variation.attributes) {
            setAttributes(variation.attributes);
          }
          if (variation.innerBlocks) {
            replaceInnerBlocks(
              clientId,
              createBlocksFromInnerBlocksTemplate(variation.innerBlocks),
              true,
            );
          }
        }}
      />
    </div>
  );
}

/**
 * Sélecteur de disposition tant que la grille est vide, grille ensuite
 * (même fonctionnement que core/columns).
 */
export default function Edit(props) {
  const { clientId } = props;
  const hasInnerBlocks = useSelect(
    (select) => select(blockEditorStore).getBlocks(clientId).length > 0,
    [clientId],
  );
  const Component = hasInnerBlocks ? GridEditContainer : Placeholder;

  return <Component {...props} />;
}
