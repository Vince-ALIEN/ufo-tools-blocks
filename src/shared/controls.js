/**
 * Contrôles d'inspecteur partagés par ufo-grid et ufo-row, sur le modèle des
 * panneaux des blocs core (ToolsPanel avec réinitialisation, médias avec
 * aperçu, matrice de position).
 */
import { __ } from "@wordpress/i18n";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import {
  Button,
  Flex,
  FlexItem,
  RangeControl,
  SelectControl,
  __experimentalToolsPanel as ToolsPanel,
  __experimentalToolsPanelItem as ToolsPanelItem,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
  __experimentalAlignmentMatrixControl as AlignmentMatrixControl,
  BaseControl,
} from "@wordpress/components";
import { useViewportMatch } from "@wordpress/compose";

/**
 * Même placement du menu « ⋮ » des ToolsPanel que dans les blocs core.
 */
export function useToolsPanelDropdownMenuProps() {
  const isMobile = useViewportMatch("medium", "<");
  return !isMobile
    ? { popoverProps: { placement: "left-start", offset: 259 } }
    : {};
}

/**
 * Valeurs par défaut des attributs déclarés dans un block.json.
 */
export function getAttributeDefaults(metadata) {
  return Object.fromEntries(
    Object.entries(metadata.attributes).map(([name, { default: value }]) => [
      name,
      value,
    ]),
  );
}

/**
 * ToolsPanel dont « Tout réinitialiser » remet les attributs listés à leur
 * valeur par défaut. Chaque enfant est un PanelItem.
 */
export function UfoToolsPanel({ label, defaults, keys, setAttributes, children }) {
  const dropdownMenuProps = useToolsPanelDropdownMenuProps();
  return (
    <ToolsPanel
      label={label}
      resetAll={() => setAttributes(pick(defaults, keys))}
      dropdownMenuProps={dropdownMenuProps}
    >
      {children}
    </ToolsPanel>
  );
}

/**
 * ToolsPanelItem lié à un ou plusieurs attributs : il a une valeur dès que
 * l'un d'eux s'écarte de sa valeur par défaut.
 */
export function PanelItem({
  label,
  keys,
  attributes,
  defaults,
  setAttributes,
  isShownByDefault = false,
  children,
}) {
  return (
    <ToolsPanelItem
      label={label}
      isShownByDefault={isShownByDefault}
      hasValue={() =>
        keys.some(
          (key) =>
            JSON.stringify(attributes[key]) !== JSON.stringify(defaults[key]),
        )
      }
      onDeselect={() => setAttributes(pick(defaults, keys))}
    >
      {children}
    </ToolsPanelItem>
  );
}

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}

const COMMON_CONTROL_PROPS = {
  __nextHasNoMarginBottom: true,
  __next40pxDefaultSize: true,
};

/**
 * Valeur Tailwind de l'échelle d'espacement (N × 0,25rem = N × 4px).
 */
function spacingHelp(value) {
  return `${Number(value || 0) * 4}px`;
}

/**
 * Curseur pour un attribut texte de l'échelle Tailwind (« 0 », « 2 »…).
 */
export function SpacingRangeControl({ label, value, onChange, max = 16, step = 2, help }) {
  return (
    <RangeControl
      {...COMMON_CONTROL_PROPS}
      label={label}
      value={Number(value || 0)}
      onChange={(next) => onChange(String(next ?? 0))}
      min={0}
      max={max}
      step={step}
      withInputField
      help={help ?? spacingHelp(value)}
    />
  );
}

export const MIN_HEIGHT_OPTIONS = [
  { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
  { label: "24 (96px)", value: "24" },
  { label: "32 (128px)", value: "32" },
  { label: "40 (160px)", value: "40" },
  { label: "48 (192px)", value: "48" },
  { label: "56 (224px)", value: "56" },
  { label: "64 (256px)", value: "64" },
  { label: "72 (288px)", value: "72" },
  { label: "80 (320px)", value: "80" },
  { label: "96 (384px)", value: "96" },
  { label: "120 (480px)", value: "120" },
  { label: "150 (600px)", value: "150" },
];

export function HeightSelectControl({ label, value, options, onChange, help }) {
  return (
    <SelectControl
      {...COMMON_CONTROL_PROPS}
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      help={help}
    />
  );
}

const BORDER_RADIUS_OPTIONS = [
  { label: __("Aucun", "ufo-tools-blocks"), value: "" },
  { label: __("SM (4px)", "ufo-tools-blocks"), value: "sm" },
  { label: __("MD (6px)", "ufo-tools-blocks"), value: "md" },
  { label: __("LG (8px)", "ufo-tools-blocks"), value: "lg" },
  { label: __("XL (12px)", "ufo-tools-blocks"), value: "xl" },
  { label: __("2XL (16px)", "ufo-tools-blocks"), value: "2xl" },
  { label: __("3XL (24px)", "ufo-tools-blocks"), value: "3xl" },
];

export function BorderRadiusControl({ value, onChange }) {
  return (
    <SelectControl
      {...COMMON_CONTROL_PROPS}
      label={__("Arrondi des coins", "ufo-tools-blocks")}
      value={value}
      options={BORDER_RADIUS_OPTIONS}
      onChange={onChange}
      help={__("Classes Tailwind rounded-*", "ufo-tools-blocks")}
    />
  );
}

/**
 * Sélecteur de média avec aperçu, boutons Remplacer / Supprimer.
 */
export function MediaControl({ label, media, allowedTypes, onSelect, onRemove }) {
  const hasMedia = !!media?.url;
  const isImage = allowedTypes.includes("image");

  return (
    <BaseControl __nextHasNoMarginBottom label={label}>
      <MediaUploadCheck>
        <MediaUpload
          onSelect={onSelect}
          allowedTypes={allowedTypes}
          value={media?.id}
          render={({ open }) => (
            <div className="ufo-media-control">
              {hasMedia && isImage && (
                <button
                  type="button"
                  className="ufo-media-control__preview"
                  onClick={open}
                  aria-label={__("Remplacer l'image", "ufo-tools-blocks")}
                >
                  <img src={media.url} alt="" />
                </button>
              )}
              {hasMedia && !isImage && (
                <p className="ufo-media-control__filename">
                  {media.url.split("/").pop()}
                </p>
              )}
              <Flex justify="flex-start" gap={2}>
                <FlexItem>
                  <Button
                    __next40pxDefaultSize
                    variant="secondary"
                    onClick={open}
                  >
                    {hasMedia
                      ? __("Remplacer", "ufo-tools-blocks")
                      : __("Choisir un média", "ufo-tools-blocks")}
                  </Button>
                </FlexItem>
                {hasMedia && (
                  <FlexItem>
                    <Button
                      __next40pxDefaultSize
                      variant="tertiary"
                      isDestructive
                      onClick={onRemove}
                    >
                      {__("Supprimer", "ufo-tools-blocks")}
                    </Button>
                  </FlexItem>
                )}
              </Flex>
            </div>
          )}
        />
      </MediaUploadCheck>
    </BaseControl>
  );
}

const EMPTY_IMAGE = { url: "", id: null, alt: "" };

/**
 * Panneau « Arrière-plan » de l'onglet Styles : image, taille, position et,
 * pour la grille, vidéo (passée en enfant).
 */
export function BackgroundPanel({ attributes, setAttributes, defaults, children, extraKeys = [] }) {
  const { backgroundImage, backgroundSize, backgroundPosition } = attributes;
  const itemProps = { attributes, defaults, setAttributes };
  const hasImage = !!backgroundImage?.url;

  return (
    <UfoToolsPanel
      label={__("Image et vidéo de fond", "ufo-tools-blocks")}
      defaults={defaults}
      keys={["backgroundImage", "backgroundSize", "backgroundPosition", ...extraKeys]}
      setAttributes={setAttributes}
    >
      <PanelItem
        {...itemProps}
        label={__("Image", "ufo-tools-blocks")}
        keys={["backgroundImage", "backgroundSize", "backgroundPosition"]}
        isShownByDefault
      >
        <MediaControl
          label={__("Image", "ufo-tools-blocks")}
          media={backgroundImage}
          allowedTypes={["image"]}
          onSelect={(media) =>
            setAttributes({
              backgroundImage: { url: media.url, id: media.id, alt: media.alt },
            })
          }
          onRemove={() => setAttributes({ backgroundImage: EMPTY_IMAGE })}
        />
        {hasImage && (
          <>
            <ToggleGroupControl
              {...COMMON_CONTROL_PROPS}
              className="ufo-media-control__size"
              label={__("Taille", "ufo-tools-blocks")}
              value={backgroundSize || "cover"}
              onChange={(value) => setAttributes({ backgroundSize: value })}
              isBlock
            >
              <ToggleGroupControlOption value="cover" label={__("Couvrir", "ufo-tools-blocks")} />
              <ToggleGroupControlOption value="contain" label={__("Contenir", "ufo-tools-blocks")} />
              <ToggleGroupControlOption value="auto" label={__("Auto", "ufo-tools-blocks")} />
            </ToggleGroupControl>
            <BaseControl
              __nextHasNoMarginBottom
              label={__("Position", "ufo-tools-blocks")}
             
            >
              <AlignmentMatrixControl
                value={backgroundPosition || "center center"}
                onChange={(value) => setAttributes({ backgroundPosition: value })}
              />
            </BaseControl>
          </>
        )}
      </PanelItem>
      {children}
    </UfoToolsPanel>
  );
}
