import { __, sprintf } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import {
  useBlockProps,
  useInnerBlocksProps,
  RichText,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { Plus } from "lucide-react";
import clsx from "clsx";
import {
  NAV_WRAPPER_CLASSES,
  NAV_CLASSES,
  TAB_CLASSES,
  PANELS_CLASSES,
} from "./classes";
import "./editor.css";

const TAB = "ufo-blocks/ufo-tab";

const defaultTitle = (index) =>
  /* translators: %d: numéro de l'onglet */
  sprintf(__("Onglet %d", "ufo-tools-blocks"), index + 1);

const TEMPLATE = [0, 1, 2].map((index) => [
  TAB,
  { title: defaultTitle(index) },
  [["core/paragraph"]],
]);

export default function Edit({ clientId }) {
  const { tabs, selectedTabId } = useSelect(
    (select) => {
      const { getBlocks, getSelectedBlockClientId, getBlockParents } =
        select(blockEditorStore);
      const children = getBlocks(clientId);
      const ids = children.map((tab) => tab.clientId);
      const selected = getSelectedBlockClientId();
      // Onglet contenant le bloc sélectionné (lui-même ou un descendant).
      const owner = selected
        ? [selected, ...getBlockParents(selected, true)].find((id) =>
            ids.includes(id)
          )
        : undefined;
      return { tabs: children, selectedTabId: owner };
    },
    [clientId]
  );
  const { insertBlock, updateBlockAttributes } = useDispatch(blockEditorStore);

  const [activeId, setActiveId] = useState(null);

  // Sélectionner un bloc dans un onglet (liste des blocs…) affiche cet onglet.
  useEffect(() => {
    if (selectedTabId) {
      setActiveId(selectedTabId);
    }
  }, [selectedTabId]);

  const currentId = tabs.some((tab) => tab.clientId === activeId)
    ? activeId
    : tabs[0]?.clientId;

  const addTab = () => {
    const tab = createBlock(TAB, { title: defaultTitle(tabs.length) }, [
      createBlock("core/paragraph"),
    ]);
    insertBlock(tab, tabs.length, clientId, false);
    setActiveId(tab.clientId);
  };

  const blockProps = useBlockProps({ className: "px-4" });
  const innerBlocksProps = useInnerBlocksProps(
    { className: PANELS_CLASSES },
    {
      allowedBlocks: [TAB],
      template: TEMPLATE,
      templateLock: false,
      renderAppender: false,
    }
  );

  // Seul le panneau de l'onglet actif est affiché.
  const hiddenPanels = tabs
    .filter((tab) => tab.clientId !== currentId)
    .map((tab) => `#block-${tab.clientId}{display:none}`)
    .join("");

  return (
    <div {...blockProps}>
      {hiddenPanels && <style>{hiddenPanels}</style>}
      <div className={NAV_WRAPPER_CLASSES}>
        <div
          className={NAV_CLASSES}
          role="tablist"
          aria-label={__("Onglets", "ufo-tools-blocks")}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.clientId === currentId;
            return (
              <div
                key={tab.clientId}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? -1 : 0}
                className={TAB_CLASSES}
                onClick={() => setActiveId(tab.clientId)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    setActiveId(tab.clientId);
                  }
                }}
              >
                {isActive ? (
                  <RichText
                    tagName="span"
                    value={tab.attributes.title}
                    onChange={(title) =>
                      updateBlockAttributes(tab.clientId, { title })
                    }
                    placeholder={defaultTitle(index)}
                    allowedFormats={[]}
                    withoutInteractiveFormatting
                    disableLineBreaks
                  />
                ) : (
                  <span>{tab.attributes.title || defaultTitle(index)}</span>
                )}
              </div>
            );
          })}
          <button
            type="button"
            className={clsx(TAB_CLASSES, "ufo-tabs__add")}
            onClick={addTab}
            aria-label={__("Ajouter un onglet", "ufo-tools-blocks")}
            title={__("Ajouter un onglet", "ufo-tools-blocks")}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div {...innerBlocksProps} />
    </div>
  );
}
