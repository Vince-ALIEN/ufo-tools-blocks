import { __ } from "@wordpress/i18n";
import {
  InspectorControls,
  BlockControls,
  BlockVerticalAlignmentToolbar,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl, RangeControl, Button } from "@wordpress/components";

export default function Inspector({ attributes, setAttributes }) {
  const {
    colSpan,
    colStart,
    colEnd,
    rowSpan,
    rowStart,
    rowEnd,
    minHeight,
    height,
    verticalAlignment,
    borderRadius,
    paddingY,
    paddingX,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
  } = attributes;

  return (
    <>
      <BlockControls>
        <BlockVerticalAlignmentToolbar
          value={verticalAlignment}
          onChange={(newAlignment) =>
            setAttributes({ verticalAlignment: newAlignment })
          }
        />
      </BlockControls>

      <InspectorControls>
        <PanelBody
          title={__("Disposition de la colonne", "ufo-tools-blocks")}
          initialOpen={true}
        >
          <RangeControl
            label={__("Col-span", "ufo-tools-blocks")}
            value={colSpan ? parseInt(colSpan, 10) : undefined}
            onChange={(value) =>
              setAttributes({ colSpan: value ? String(value) : "" })
            }
            min={1}
            max={6}
            allowReset
            resetFallbackValue={undefined}
            help={__("Nombre de colonnes que cet élément doit occuper", "ufo-tools-blocks")}
          />

          <RangeControl
            label={__("Row-span", "ufo-tools-blocks")}
            value={rowSpan ? parseInt(rowSpan, 10) : undefined}
            onChange={(value) =>
              setAttributes({ rowSpan: value ? String(value) : "" })
            }
            min={1}
            max={6}
            allowReset
            resetFallbackValue={undefined}
            help={__("Nombre de lignes que cet élément doit occuper", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Col-start", "ufo-tools-blocks")}
            value={colStart}
            options={[
              { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
              { label: __("1", "ufo-tools-blocks"), value: "1" },
              { label: __("2", "ufo-tools-blocks"), value: "2" },
              { label: __("3", "ufo-tools-blocks"), value: "3" },
              { label: __("4", "ufo-tools-blocks"), value: "4" },
              { label: __("5", "ufo-tools-blocks"), value: "5" },
              { label: __("6", "ufo-tools-blocks"), value: "6" },
              { label: __("7", "ufo-tools-blocks"), value: "7" },
            ]}
            onChange={(newColStart) => setAttributes({ colStart: newColStart })}
            help={__("Position de départ de la colonne dans la grille", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Col-end", "ufo-tools-blocks")}
            value={colEnd}
            options={[
              { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
              { label: __("1", "ufo-tools-blocks"), value: "1" },
              { label: __("2", "ufo-tools-blocks"), value: "2" },
              { label: __("3", "ufo-tools-blocks"), value: "3" },
              { label: __("4", "ufo-tools-blocks"), value: "4" },
              { label: __("5", "ufo-tools-blocks"), value: "5" },
              { label: __("6", "ufo-tools-blocks"), value: "6" },
              { label: __("7", "ufo-tools-blocks"), value: "7" },
              { label: __("8", "ufo-tools-blocks"), value: "8" },
            ]}
            onChange={(newColEnd) => setAttributes({ colEnd: newColEnd })}
            help={__("Position de fin de la colonne dans la grille", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Row-start", "ufo-tools-blocks")}
            value={rowStart}
            options={[
              { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
              { label: __("1", "ufo-tools-blocks"), value: "1" },
              { label: __("2", "ufo-tools-blocks"), value: "2" },
              { label: __("3", "ufo-tools-blocks"), value: "3" },
              { label: __("4", "ufo-tools-blocks"), value: "4" },
              { label: __("5", "ufo-tools-blocks"), value: "5" },
              { label: __("6", "ufo-tools-blocks"), value: "6" },
              { label: __("7", "ufo-tools-blocks"), value: "7" },
            ]}
            onChange={(newRowStart) => setAttributes({ rowStart: newRowStart })}
            help={__("Position de départ de la ligne dans la grille", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Row-end", "ufo-tools-blocks")}
            value={rowEnd}
            options={[
              { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
              { label: __("1", "ufo-tools-blocks"), value: "1" },
              { label: __("2", "ufo-tools-blocks"), value: "2" },
              { label: __("3", "ufo-tools-blocks"), value: "3" },
              { label: __("4", "ufo-tools-blocks"), value: "4" },
              { label: __("5", "ufo-tools-blocks"), value: "5" },
              { label: __("6", "ufo-tools-blocks"), value: "6" },
              { label: __("7", "ufo-tools-blocks"), value: "7" },
            ]}
            onChange={(newRowEnd) => setAttributes({ rowEnd: newRowEnd })}
            help={__("Position de fin de la ligne dans la grille", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Hauteur minimale", "ufo-tools-blocks")}
            value={minHeight}
            options={[
              { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
              { label: "24 (96px)",   value: "24" },
              { label: "32 (128px)",  value: "32" },
              { label: "40 (160px)",  value: "40" },
              { label: "48 (192px)",  value: "48" },
              { label: "56 (224px)",  value: "56" },
              { label: "64 (256px)",  value: "64" },
              { label: "72 (288px)",  value: "72" },
              { label: "80 (320px)",  value: "80" },
              { label: "96 (384px)",  value: "96" },
              { label: "120 (480px)", value: "120" },
              { label: "150 (600px)", value: "150" },
              { label: __("100 %", "ufo-tools-blocks"), value: "full" },
              { label: __("Screen (100vh)", "ufo-tools-blocks"), value: "screen" },
            ]}
            onChange={(newMinHeight) => setAttributes({ minHeight: newMinHeight })}
            help={__("Hauteur minimale de l'élément", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Hauteur fixe", "ufo-tools-blocks")}
            value={height}
            options={[
              { label: __("Auto (par défaut)", "ufo-tools-blocks"), value: "" },
              { label: __("24 (96px)", "ufo-tools-blocks"), value: "24" },
              { label: __("32 (128px)", "ufo-tools-blocks"), value: "32" },
              { label: __("40 (160px)", "ufo-tools-blocks"), value: "40" },
              { label: __("48 (192px)", "ufo-tools-blocks"), value: "48" },
              { label: __("56 (224px)", "ufo-tools-blocks"), value: "56" },
              { label: __("64 (256px)", "ufo-tools-blocks"), value: "64" },
              { label: __("72 (288px)", "ufo-tools-blocks"), value: "72" },
              { label: __("80 (320px)", "ufo-tools-blocks"), value: "80" },
              { label: __("96 (384px)", "ufo-tools-blocks"), value: "96" },
              { label: "120 (480px)", value: "120" },
              { label: "150 (600px)", value: "150" },
              { label: __("Screen (100vh)", "ufo-tools-blocks"), value: "screen" },
            ]}
            onChange={(newHeight) => setAttributes({ height: newHeight })}
            help={__("Hauteur fixe de l'élément (h-*)", "ufo-tools-blocks")}
          />

          <SelectControl
            label={__("Padding horizontal (X)", "ufo-tools-blocks")}
            value={paddingX}
            options={[
              { label: __("0 - Aucun", "ufo-tools-blocks"), value: "0" },
              { label: __("2 (8px)", "ufo-tools-blocks"), value: "2" },
              { label: __("4 (16px)", "ufo-tools-blocks"), value: "4" },
              { label: __("6 (24px)", "ufo-tools-blocks"), value: "6" },
              { label: __("8 (32px)", "ufo-tools-blocks"), value: "8" },
              { label: __("10 (40px)", "ufo-tools-blocks"), value: "10" },
              { label: __("12 (48px)", "ufo-tools-blocks"), value: "12" },
              { label: __("14 (56px)", "ufo-tools-blocks"), value: "14" },
              { label: __("16 (64px)", "ufo-tools-blocks"), value: "16" },
            ]}
            onChange={(newPaddingX) => setAttributes({ paddingX: newPaddingX })}
          />

          <SelectControl
            label={__("Padding vertical (Y)", "ufo-tools-blocks")}
            value={paddingY}
            options={[
              { label: __("0 - Aucun", "ufo-tools-blocks"), value: "0" },
              { label: __("2 (8px)", "ufo-tools-blocks"), value: "2" },
              { label: __("4 (16px)", "ufo-tools-blocks"), value: "4" },
              { label: __("6 (24px)", "ufo-tools-blocks"), value: "6" },
              { label: __("8 (32px)", "ufo-tools-blocks"), value: "8" },
              { label: __("10 (40px)", "ufo-tools-blocks"), value: "10" },
              { label: __("12 (48px)", "ufo-tools-blocks"), value: "12" },
              { label: __("14 (56px)", "ufo-tools-blocks"), value: "14" },
              { label: __("16 (64px)", "ufo-tools-blocks"), value: "16" },
            ]}
            onChange={(newPaddingY) => setAttributes({ paddingY: newPaddingY })}
          />
        </PanelBody>
      </InspectorControls>

      <InspectorControls group="styles">
        <PanelBody
          title={__("Image d'arrière-plan", "ufo-tools-blocks")}
          initialOpen={false}
        >
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media) =>
                setAttributes({
                  backgroundImage: { url: media.url, id: media.id, alt: media.alt },
                })
              }
              allowedTypes={["image"]}
              value={backgroundImage?.id}
              render={({ open }) => (
                <Button
                  onClick={open}
                  variant={backgroundImage?.id ? "secondary" : "primary"}
                  className="mb-4"
                >
                  {backgroundImage?.id
                    ? __("Remplacer l'image", "ufo-tools-blocks")
                    : __("Ajouter une image", "ufo-tools-blocks")}
                </Button>
              )}
            />
          </MediaUploadCheck>

          {backgroundImage?.id && (
            <>
              <Button
                onClick={() =>
                  setAttributes({ backgroundImage: { url: "", id: null, alt: "" } })
                }
                isDestructive
                className="mb-4"
              >
                {__("Supprimer l'image", "ufo-tools-blocks")}
              </Button>

              <SelectControl
                label={__("Taille de l'image", "ufo-tools-blocks")}
                value={backgroundSize}
                options={[
                  { label: __("Cover", "ufo-tools-blocks"), value: "cover" },
                  { label: __("Contain", "ufo-tools-blocks"), value: "contain" },
                  { label: __("Auto", "ufo-tools-blocks"), value: "auto" },
                ]}
                onChange={(value) => setAttributes({ backgroundSize: value })}
              />

              <SelectControl
                label={__("Position de l'image", "ufo-tools-blocks")}
                value={backgroundPosition}
                options={[
                  { label: __("Centre", "ufo-tools-blocks"), value: "center center" },
                  { label: __("Haut gauche", "ufo-tools-blocks"), value: "top left" },
                  { label: __("Haut centre", "ufo-tools-blocks"), value: "top center" },
                  { label: __("Haut droite", "ufo-tools-blocks"), value: "top right" },
                  { label: __("Centre gauche", "ufo-tools-blocks"), value: "center left" },
                  { label: __("Centre droite", "ufo-tools-blocks"), value: "center right" },
                  { label: __("Bas gauche", "ufo-tools-blocks"), value: "bottom left" },
                  { label: __("Bas centre", "ufo-tools-blocks"), value: "bottom center" },
                  { label: __("Bas droite", "ufo-tools-blocks"), value: "bottom right" },
                ]}
                onChange={(value) => setAttributes({ backgroundPosition: value })}
              />
            </>
          )}
        </PanelBody>

        <PanelBody
          title={__("Border Radius", "ufo-tools-blocks")}
          initialOpen={false}
        >
          <SelectControl
            label={__("Border Radius", "ufo-tools-blocks")}
            value={borderRadius}
            options={[
              { label: __("Aucun", "ufo-tools-blocks"), value: "" },
              { label: __("SM (4px)", "ufo-tools-blocks"), value: "sm" },
              { label: __("MD (6px)", "ufo-tools-blocks"), value: "md" },
              { label: __("LG (8px)", "ufo-tools-blocks"), value: "lg" },
              { label: __("XL (12px)", "ufo-tools-blocks"), value: "xl" },
              { label: __("2XL (16px)", "ufo-tools-blocks"), value: "2xl" },
              { label: __("3XL (24px)", "ufo-tools-blocks"), value: "3xl" },
            ]}
            onChange={(newBorderRadius) =>
              setAttributes({ borderRadius: newBorderRadius })
            }
            help={__("Arrondi des coins (classes Tailwind rounded-*)", "ufo-tools-blocks")}
          />
        </PanelBody>
      </InspectorControls>
    </>
  );
}
