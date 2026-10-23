import { __ } from "@wordpress/i18n";
import {
  InspectorControls,
  BlockControls,
  BlockVerticalAlignmentToolbar,
} from "@wordpress/block-editor";
import { RangeControl, ToggleControl } from "@wordpress/components";
import {
  UfoToolsPanel,
  PanelItem,
  SpacingRangeControl,
  HeightSelectControl,
  BorderRadiusControl,
  BackgroundPanel,
  MediaControl,
  MIN_HEIGHT_OPTIONS,
  getAttributeDefaults,
} from "../shared/controls";
import metadata from "./block.json";

const DEFAULTS = getAttributeDefaults(metadata);

const GRID_KEYS = ["columnsCount", "rowsCount", "gap", "equalRows", "reverseMobile"];
const DIMENSION_KEYS = ["minHeight", "isBoxed", "paddingX", "paddingY"];

const GRID_MIN_HEIGHT_OPTIONS = [
  ...MIN_HEIGHT_OPTIONS,
  { label: __("100 %", "ufo-tools-blocks"), value: "h-full" },
  { label: __("Écran (100vh)", "ufo-tools-blocks"), value: "screen" },
];

export default function Inspector({
  attributes,
  setAttributes,
  setColumnsCount,
  setVerticalAlignment,
}) {
  const {
    columnsCount,
    rowsCount,
    gap,
    verticalAlignment,
    reverseMobile,
    equalRows,
    minHeight,
    borderRadius,
    isBoxed,
    backgroundVideo,
    paddingX,
    paddingY,
  } = attributes;

  const itemProps = { attributes, defaults: DEFAULTS, setAttributes };

  return (
    <>
      <BlockControls>
        <BlockVerticalAlignmentToolbar
          onChange={setVerticalAlignment}
          value={verticalAlignment}
        />
      </BlockControls>

      <InspectorControls>
        <UfoToolsPanel
          label={__("Grille", "ufo-tools-blocks")}
          defaults={DEFAULTS}
          keys={GRID_KEYS}
          setAttributes={setAttributes}
        >
          <PanelItem
            {...itemProps}
            label={__("Colonnes", "ufo-tools-blocks")}
            keys={["columnsCount"]}
            isShownByDefault
          >
            <RangeControl
              __nextHasNoMarginBottom
              __next40pxDefaultSize
              label={__("Colonnes", "ufo-tools-blocks")}
              value={columnsCount}
              onChange={(value) => setColumnsCount(value ?? DEFAULTS.columnsCount)}
              min={1}
              max={6}
              help={__(
                "À partir de la largeur md. En dessous, les cellules s'empilent.",
                "ufo-tools-blocks",
              )}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Espacement", "ufo-tools-blocks")}
            keys={["gap"]}
            isShownByDefault
          >
            <SpacingRangeControl
              label={__("Espacement entre les cellules", "ufo-tools-blocks")}
              value={gap}
              max={8}
              step={1}
              onChange={(value) => setAttributes({ gap: value })}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Lignes", "ufo-tools-blocks")}
            keys={["rowsCount"]}
          >
            <RangeControl
              __nextHasNoMarginBottom
              __next40pxDefaultSize
              label={__("Lignes", "ufo-tools-blocks")}
              value={rowsCount}
              onChange={(value) => setAttributes({ rowsCount: value ?? 0 })}
              min={0}
              max={6}
              help={
                rowsCount
                  ? __("Nombre de lignes fixe.", "ufo-tools-blocks")
                  : __("0 : autant de lignes que nécessaire.", "ufo-tools-blocks")
              }
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Lignes de hauteur égale", "ufo-tools-blocks")}
            keys={["equalRows"]}
            isShownByDefault
          >
            <ToggleControl
              __nextHasNoMarginBottom
              label={__("Lignes de hauteur égale", "ufo-tools-blocks")}
              checked={equalRows}
              onChange={() => setAttributes({ equalRows: !equalRows })}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Inverser sur mobile", "ufo-tools-blocks")}
            keys={["reverseMobile"]}
            isShownByDefault
          >
            <ToggleControl
              __nextHasNoMarginBottom
              label={__("Inverser l'ordre sur mobile", "ufo-tools-blocks")}
              checked={reverseMobile}
              onChange={() => setAttributes({ reverseMobile: !reverseMobile })}
            />
          </PanelItem>
        </UfoToolsPanel>

        <UfoToolsPanel
          label={__("Dimensions (Tailwind)", "ufo-tools-blocks")}
          defaults={DEFAULTS}
          keys={DIMENSION_KEYS}
          setAttributes={setAttributes}
        >
          <PanelItem
            {...itemProps}
            label={__("Hauteur", "ufo-tools-blocks")}
            keys={["minHeight"]}
            isShownByDefault
          >
            <HeightSelectControl
              label={__("Hauteur", "ufo-tools-blocks")}
              value={minHeight}
              options={GRID_MIN_HEIGHT_OPTIONS}
              onChange={(value) => setAttributes({ minHeight: value })}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Conteneur centré", "ufo-tools-blocks")}
            keys={["isBoxed"]}
            isShownByDefault
          >
            <ToggleControl
              __nextHasNoMarginBottom
              label={__("Conteneur centré (max-w-content)", "ufo-tools-blocks")}
              checked={isBoxed}
              onChange={() => setAttributes({ isBoxed: !isBoxed })}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Marges internes", "ufo-tools-blocks")}
            keys={["paddingX", "paddingY"]}
            isShownByDefault
          >
            <SpacingRangeControl
              label={__("Marge interne horizontale", "ufo-tools-blocks")}
              value={paddingX}
              onChange={(value) => setAttributes({ paddingX: value })}
            />
            <SpacingRangeControl
              label={__("Marge interne verticale", "ufo-tools-blocks")}
              value={paddingY}
              onChange={(value) => setAttributes({ paddingY: value })}
            />
          </PanelItem>
        </UfoToolsPanel>
      </InspectorControls>

      <InspectorControls group="styles">
        <BackgroundPanel
          attributes={attributes}
          setAttributes={setAttributes}
          defaults={DEFAULTS}
          extraKeys={["backgroundVideo"]}
        >
          <PanelItem
            {...itemProps}
            label={__("Vidéo", "ufo-tools-blocks")}
            keys={["backgroundVideo"]}
          >
            <MediaControl
              label={__("Vidéo", "ufo-tools-blocks")}
              media={backgroundVideo}
              allowedTypes={["video"]}
              onSelect={(media) =>
                setAttributes({ backgroundVideo: { url: media.url, id: media.id } })
              }
              onRemove={() => setAttributes({ backgroundVideo: DEFAULTS.backgroundVideo })}
            />
          </PanelItem>
        </BackgroundPanel>

        <UfoToolsPanel
          label={__("Arrondi (Tailwind)", "ufo-tools-blocks")}
          defaults={DEFAULTS}
          keys={["borderRadius"]}
          setAttributes={setAttributes}
        >
          <PanelItem
            {...itemProps}
            label={__("Arrondi des coins", "ufo-tools-blocks")}
            keys={["borderRadius"]}
            isShownByDefault
          >
            <BorderRadiusControl
              value={borderRadius}
              onChange={(value) => setAttributes({ borderRadius: value })}
            />
          </PanelItem>
        </UfoToolsPanel>
      </InspectorControls>
    </>
  );
}
