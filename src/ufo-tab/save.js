import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";

/**
 * Contenu seul : le titre est lu par le rendu de ufo-tabs (render.php), qui
 * construit la barre d'onglets et enveloppe ce contenu dans le tabpanel.
 */
export default function save() {
  return <div {...useInnerBlocksProps.save(useBlockProps.save())} />;
}
