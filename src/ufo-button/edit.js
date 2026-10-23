import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  RichText,
  InspectorControls,
  BlockControls,
  LinkControl,
} from "@wordpress/block-editor";
import {
  PanelBody,
  ToolbarGroup,
  ToolbarButton,
  ToggleControl,
  TextControl,
  BaseControl,
  Button,
  Popover,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from "@wordpress/components";
import { alignLeft, alignRight } from "@wordpress/icons";
import { link, linkOff } from "@wordpress/icons";
import { useState } from "@wordpress/element";
import { ICONS, ICON_LIST } from "../shared/icons";
import clsx from "clsx";
import "./editor.css";

function Edit({ attributes, setAttributes }) {
  const {
    buttonText,
    buttonUrl,
    buttonIcon,
    opensInNewTab,
    relNofollow,
    iconPosition,
    isFullWidth,
    screenReaderText,
  } = attributes;

  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const blockProps = useBlockProps();
  const IconComponent = ICONS[buttonIcon];

  const buttonClasses = clsx(
    "btn inline-flex items-center gap-2 no-underline group cursor-pointer",
    { "w-full justify-center is-full-width": isFullWidth }
  );

  return (
    <>
      <BlockControls>
        <ToolbarGroup>
          <ToolbarButton
            icon={buttonUrl ? linkOff : link}
            title={
              buttonUrl
                ? __("Modifier le lien", "ufo-tools-blocks")
                : __("Ajouter un lien", "ufo-tools-blocks")
            }
            onClick={() => setIsLinkPopoverOpen((v) => !v)}
            isActive={!!buttonUrl || isLinkPopoverOpen}
          />
        </ToolbarGroup>
      </BlockControls>

      {isLinkPopoverOpen && (
        <Popover
          placement="bottom"
          onClose={() => setIsLinkPopoverOpen(false)}
          focusOnMount
        >
          <div style={{ padding: "8px", minWidth: 320 }}>
            <LinkControl
              value={{ url: buttonUrl, opensInNewTab }}
              onChange={({ url, opensInNewTab: newTab }) => {
                setAttributes({
                  buttonUrl: url || "",
                  opensInNewTab: newTab || false,
                });
              }}
              settings={[
                {
                  id: "opensInNewTab",
                  title: __("Ouvrir dans un nouvel onglet", "ufo-tools-blocks"),
                },
              ]}
            />
            {buttonUrl && (
              <Button
                variant="tertiary"
                isDestructive
                onClick={() => {
                  setAttributes({ buttonUrl: "", opensInNewTab: false, relNofollow: false });
                  setIsLinkPopoverOpen(false);
                }}
                style={{ marginTop: 8 }}
              >
                {__("Supprimer le lien", "ufo-tools-blocks")}
              </Button>
            )}
          </div>
        </Popover>
      )}

      <InspectorControls>
        <PanelBody title={__("Icône", "ufo-tools-blocks")} initialOpen>
          <BaseControl label={__("Choisir une icône", "ufo-tools-blocks")}>
            <div className="ufo-icon-picker">
              <button
                className={clsx("ufo-icon-picker__item", { "is-selected": !buttonIcon })}
                onClick={() => setAttributes({ buttonIcon: "" })}
                title={__("Aucune icône", "ufo-tools-blocks")}
                aria-label={__("Aucune icône", "ufo-tools-blocks")}
                aria-pressed={!buttonIcon}
              >
                <span style={{ fontSize: 10, lineHeight: 1 }}>—</span>
              </button>
              {ICON_LIST.map(({ value, label }) => {
                const Icon = ICONS[value];
                return (
                  <button
                    key={value}
                    className={clsx("ufo-icon-picker__item", { "is-selected": buttonIcon === value })}
                    onClick={() => setAttributes({ buttonIcon: value })}
                    title={label}
                    aria-label={label}
                    aria-pressed={buttonIcon === value}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </BaseControl>
          {buttonIcon && (
            <ToggleGroupControl
              label={__("Position de l'icône", "ufo-tools-blocks")}
              value={iconPosition}
              onChange={(val) => setAttributes({ iconPosition: val })}
              isBlock
              __next40pxDefaultSize
              __nextHasNoMarginBottom
            >
              <ToggleGroupControlOptionIcon value="left"  icon={alignLeft}  label={__("Gauche", "ufo-tools-blocks")} />
              <ToggleGroupControlOptionIcon value="right" icon={alignRight} label={__("Droite", "ufo-tools-blocks")} />
            </ToggleGroupControl>
          )}
        </PanelBody>

        <PanelBody title={__("Disposition", "ufo-tools-blocks")} initialOpen={false}>
          <ToggleControl
            label={__("Pleine largeur", "ufo-tools-blocks")}
            help={__("Le bouton occupe toute la largeur disponible (w-full)", "ufo-tools-blocks")}
            checked={isFullWidth}
            onChange={(value) => setAttributes({ isFullWidth: value })}
          />
        </PanelBody>

        <PanelBody title={__("Lien et accessibilité", "ufo-tools-blocks")} initialOpen={false}>
          <ToggleControl
            label={__("Ajouter nofollow", "ufo-tools-blocks")}
            checked={relNofollow}
            onChange={(value) => setAttributes({ relNofollow: value })}
          />
          <TextControl
            label={__("Texte pour lecteurs d'écran", "ufo-tools-blocks")}
            help={__("Lu après le texte du bouton, invisible à l'écran. Précise un libellé vague (ex. « En savoir plus » → « sur nos horaires »). « (nouvel onglet) » est ajouté automatiquement si le lien s'ouvre dans un nouvel onglet.", "ufo-tools-blocks")}
            value={screenReaderText}
            onChange={(value) => setAttributes({ screenReaderText: value })}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>

      <button {...blockProps} className={clsx(blockProps.className, buttonClasses)}>
        {IconComponent && iconPosition === "left" && (
          <span className="btn__icon h-4 w-4 flex items-center justify-center" aria-hidden="true">
            <IconComponent className="size-4 stroke-current" />
          </span>
        )}
        <RichText
          tagName="span"
          value={buttonText}
          onChange={(value) => setAttributes({ buttonText: value })}
          placeholder={__("Texte du bouton...", "ufo-tools-blocks")}
          allowedFormats={["core/bold", "core/italic"]}
        />
        {IconComponent && iconPosition !== "left" && (
          <span className="btn__icon h-4 w-4 flex items-center justify-center group-hover:scale-110 transition duration-700 ease-in-out" aria-hidden="true">
            <IconComponent className="size-4 stroke-current" />
          </span>
        )}
      </button>
    </>
  );
}

export default Edit;
