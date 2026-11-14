/**
 * Composants WordPress encore expérimentaux dans les versions ciblées.
 *
 * Le plugin déclare WordPress 6.1 au minimum, et ces composants viennent du
 * WordPress du site (window.wp), pas de node_modules. Leur nom stable n'existe
 * pas dans les versions anciennes : WordPress 7.1 n'expose encore ToolsPanel,
 * ToolsPanelItem et ToggleGroupControl* que sous leur nom __experimental.
 * Chaque composant prend donc le nom stable si le WordPress du site le fournit,
 * sinon le nom expérimental. Les autres fichiers importent depuis ce module,
 * jamais un __experimental* directement.
 */
import {
	ToolsPanel as StableToolsPanel,
	ToolsPanelItem as StableToolsPanelItem,
	ToggleGroupControl as StableToggleGroupControl,
	ToggleGroupControlOption as StableToggleGroupControlOption,
	ToggleGroupControlOptionIcon as StableToggleGroupControlOptionIcon,
	AlignmentMatrixControl as StableAlignmentMatrixControl,
	/* eslint-disable @wordpress/no-unsafe-wp-apis -- repli voulu, voir plus haut. */
	__experimentalToolsPanel,
	__experimentalToolsPanelItem,
	__experimentalToggleGroupControl,
	__experimentalToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon,
	__experimentalAlignmentMatrixControl,
	/* eslint-enable @wordpress/no-unsafe-wp-apis */
} from '@wordpress/components';
/* eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- aucun nom stable, même dans la dernière version de @wordpress/block-editor. */
import { __experimentalBlockVariationPicker } from '@wordpress/block-editor';

export const ToolsPanel = StableToolsPanel ?? __experimentalToolsPanel;
export const ToolsPanelItem =
	StableToolsPanelItem ?? __experimentalToolsPanelItem;
export const ToggleGroupControl =
	StableToggleGroupControl ?? __experimentalToggleGroupControl;
export const ToggleGroupControlOption =
	StableToggleGroupControlOption ?? __experimentalToggleGroupControlOption;
export const ToggleGroupControlOptionIcon =
	StableToggleGroupControlOptionIcon ??
	__experimentalToggleGroupControlOptionIcon;
export const AlignmentMatrixControl =
	StableAlignmentMatrixControl ?? __experimentalAlignmentMatrixControl;
export const BlockVariationPicker = __experimentalBlockVariationPicker;
