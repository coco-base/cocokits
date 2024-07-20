import { buttonLayoutClassNamesConfig } from './button-class-names';
import { checkboxLayoutClassNamesConfig } from './checkbox-class-names';
import { iconButtonLayoutClassNamesConfig } from './icon-button-class-names';
import { svgIconLayoutClassNamesConfig } from './icon-class-names';
import { radioGroupLayoutClassNamesConfig } from './radio-group-class-names';
import { radioButtonLayoutClassNamesConfig } from './radio-button-class-names';

/**
 * TODO: Add type definitions:
 *
 * export type ThemeUIComponentLayoutConfigs = Record<UIComponentsName, ThemeUIComponentLayoutConfig>;
 * export type ThemeUIComponentLayoutConfig = Record<string, ThemeUIComponentsLayoutProp>;
 *
 * export interface ThemeUIComponentsLayoutProp {
 *   selectors: string[];
 *   description: string;
 * }
 *
 * If we use this type then the autocomplete don't show the elements name any more
 * Because we define it as string. But without types the typescript will understand the key of `elements` map
 */

export const layoutClassNamesConfig = {
  svgIcon: svgIconLayoutClassNamesConfig,
  button: buttonLayoutClassNamesConfig,
  iconButton: iconButtonLayoutClassNamesConfig,
  checkbox: checkboxLayoutClassNamesConfig,
  radioGroup: radioGroupLayoutClassNamesConfig,
  radioButton: radioButtonLayoutClassNamesConfig,
};