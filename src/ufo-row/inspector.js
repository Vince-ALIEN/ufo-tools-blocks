import { __ } from "@wordpress/i18n";
import {
  InspectorControls,
  BlockControls,
  BlockVerticalAlignmentToolbar,
} from "@wordpress/block-editor";
import { Button, PanelBody, RangeControl, SelectControl } from "@wordpress/components";
import {
  UfoToolsPanel,
  PanelItem,
  SpacingRangeControl,
  HeightSelectControl,
  BorderRadiusControl,
  BackgroundPanel,
  MIN_HEIGHT_OPTIONS,
  getAttributeDefaults,
} from "../shared/controls";
import metadata from "./block.json";

const DEFAULTS = getAttributeDefaults(metadata);

const LAYOUT_KEYS = ["colSpan", "rowSpan", "colStart", "colEnd", "rowStart", "rowEnd"];
const DIMENSION_KEYS = ["minHeight", "height", "paddingX", "paddingY"];

const ROW_MIN_HEIGHT_OPTIONS = [
  ...MIN_HEIGHT_OPTIONS,
  { label: __("100 %", "ufo-tools-blocks"), value: "full" },
  { label: __("Écran (100vh)", "ufo-tools-blocks"), value: "screen" },
];

const HEIGHT_OPTIONS = [
  ...MIN_HEIGHT_OPTIONS,
  { label: __("Écran (100vh)", "ufo-tools-blocks"), value: "screen" },
];

// Valeurs proposées depuis toujours (et listées dans la safelist Tailwind du README).
function lineOptions(max) {
  return [
    { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
    ...Array.from({ length: max }, (_, index) => ({
      label: String(index + 1),
      value: String(index + 1),
    })),
  ];
}

const PLACEMENT_CONTROLS = [
  {
    key: "colStart",
    label: __("Colonne de départ", "ufo-tools-blocks"),
    options: lineOptions(7),
  },
  {
    key: "colEnd",
    label: __("Colonne de fin", "ufo-tools-blocks"),
    options: lineOptions(8),
  },
  {
    key: "rowStart",
    label: __("Ligne de départ", "ufo-tools-blocks"),
    options: lineOptions(7),
  },
  {
    key: "rowEnd",
    label: __("Ligne de fin", "ufo-tools-blocks"),
    options: lineOptions(7),
  },
];

function SpanControl({ label, value, max, help, onChange }) {
  return (
    <RangeControl
      __nextHasNoMarginBottom
      __next40pxDefaultSize
      label={label}
      value={value ? parseInt(value, 10) : undefined}
      initialPosition={1}
      onChange={(next) => onChange(next && next > 1 ? String(next) : "")}
      min={1}
      max={max}
      help={help}
    />
  );
}

export default function Inspector({
  attributes,
  setAttributes,
  gridColumns,
  setVerticalAlignment,
  onSelectGrid,
}) {
  const {
    colSpan,
    rowSpan,
    minHeight,
    height,
    verticalAlignment,
    borderRadius,
    paddingY,
    paddingX,
  } = attributes;

  const itemProps = { attributes, defaults: DEFAULTS, setAttributes };

  return (
    <>
      <BlockControls>
        <BlockVerticalAlignmentToolbar
          value={verticalAlignment || undefined}
          onChange={setVerticalAlignment}
        />
      </BlockControls>

      <InspectorControls>
        <PanelBody>
          <Button
            __next40pxDefaultSize
            variant="secondary"
            onClick={onSelectGrid}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {__("Modifier la grille", "ufo-tools-blocks")}
          </Button>
        </PanelBody>
        <UfoToolsPanel
          label={__("Disposition", "ufo-tools-blocks")}
          defaults={DEFAULTS}
          keys={LAYOUT_KEYS}
          setAttributes={setAttributes}
        >
          <PanelItem
            {...itemProps}
            label={__("Largeur", "ufo-tools-blocks")}
            keys={["colSpan"]}
            isShownByDefault
          >
            <SpanControl
              label={__("Largeur (colonnes)", "ufo-tools-blocks")}
              value={colSpan}
              max={Math.max(gridColumns, parseInt(colSpan, 10) || 1)}
              help={__("Nombre de colonnes de la grille occupées par la cellule.", "ufo-tools-blocks")}
              onChange={(value) => setAttributes({ colSpan: value })}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Hauteur (lignes)", "ufo-tools-blocks")}
            keys={["rowSpan"]}
            isShownByDefault
          >
            <SpanControl
              label={__("Hauteur (lignes)", "ufo-tools-blocks")}
              value={rowSpan}
              max={6}
              help={__("Nombre de lignes de la grille occupées par la cellule.", "ufo-tools-blocks")}
              onChange={(value) => setAttributes({ rowSpan: value })}
            />
          </PanelItem>

          {PLACEMENT_CONTROLS.map(({ key, label, options }) => (
            <PanelItem key={key} {...itemProps} label={label} keys={[key]}>
              <SelectControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label={label}
                value={attributes[key]}
                options={options}
                onChange={(value) => setAttributes({ [key]: value })}
              />
            </PanelItem>
          ))}
        </UfoToolsPanel>

        <UfoToolsPanel
          label={__("Dimensions (Tailwind)", "ufo-tools-blocks")}
          defaults={DEFAULTS}
          keys={DIMENSION_KEYS}
          setAttributes={setAttributes}
        >
          <PanelItem
            {...itemProps}
            label={__("Hauteur minimale", "ufo-tools-blocks")}
            keys={["minHeight"]}
            isShownByDefault
          >
            <HeightSelectControl
              label={__("Hauteur minimale", "ufo-tools-blocks")}
              value={minHeight}
              options={ROW_MIN_HEIGHT_OPTIONS}
              onChange={(value) => setAttributes({ minHeight: value })}
            />
          </PanelItem>

          <PanelItem
            {...itemProps}
            label={__("Hauteur fixe", "ufo-tools-blocks")}
            keys={["height"]}
          >
            <HeightSelectControl
              label={__("Hauteur fixe", "ufo-tools-blocks")}
              value={height}
              options={HEIGHT_OPTIONS}
              onChange={(value) => setAttributes({ height: value })}
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
        />

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
