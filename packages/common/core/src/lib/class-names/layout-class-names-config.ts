import { buttonLayoutClassNamesConfig } from './button-class-names';
import { checkboxLayoutClassNamesConfig } from './checkbox-class-names';
import { chipLayoutClassNamesConfig } from './chip-class-names';
import { chipListLayoutClassNamesConfig } from './chip-list-class-names';
import { dividerLayoutClassNamesConfig } from './divider-class-names';
import { errorLayoutClassNamesConfig } from './error-class-names';
import { formFieldLayoutClassNamesConfig } from './form-field-class-names';
import { hintLayoutClassNamesConfig } from './hint-class-names';
import { iconButtonLayoutClassNamesConfig } from './icon-button-class-names';
import { svgIconLayoutClassNamesConfig } from './icon-class-names';
import { inputLayoutClassNamesConfig } from './input-class-names';
import { labelLayoutClassNamesConfig } from './label-class-names';
import { leadingLayoutClassNamesConfig } from './leading-class-names';
import { menuLayoutClassNamesConfig } from './menu-class-names';
import { menuItemLayoutClassNamesConfig } from './menu-item-class-names';
import { optionLayoutClassNamesConfig } from './option-class-names';
import { optionGroupLayoutClassNamesConfig } from './option-group-class-names';
import { prefixLayoutClassNamesConfig } from './prefix-class-names';
import { radioButtonLayoutClassNamesConfig } from './radio-button-class-names';
import { radioGroupLayoutClassNamesConfig } from './radio-group-class-names';
import { selectLayoutClassNamesConfig } from './select-class-names';
import { selectPreviewLayoutClassNamesConfig } from './select-preview-class-names';
import { suffixLayoutClassNamesConfig } from './suffix-class-names';
import { textareaClassNamesConfig } from './textarea-class-names';
import { toggleLayoutClassNamesConfig } from './toggle-class-names';
import { trailingLayoutClassNamesConfig } from './trailing-class-names';

/**
 * TODO: Add type definitions:
 *
 * If we use the normal way to add type then the autocomplete don't show the elements name any more
 * Because we define it as string. But without types the typescript will understand the key of `elements` map
 */

export const layoutClassNamesConfig = {
  // icon
  svgIcon: svgIconLayoutClassNamesConfig,
  // button
  button: buttonLayoutClassNamesConfig,
  iconButton: iconButtonLayoutClassNamesConfig,
  // checkbox
  checkbox: checkboxLayoutClassNamesConfig,
  // radio
  radioGroup: radioGroupLayoutClassNamesConfig,
  radioButton: radioButtonLayoutClassNamesConfig,
  // form-field
  formField: formFieldLayoutClassNamesConfig,
  label: labelLayoutClassNamesConfig,
  error: errorLayoutClassNamesConfig,
  hint: hintLayoutClassNamesConfig,
  prefix: prefixLayoutClassNamesConfig,
  suffix: suffixLayoutClassNamesConfig,
  trailing: trailingLayoutClassNamesConfig,
  leading: leadingLayoutClassNamesConfig,
  input: inputLayoutClassNamesConfig,
  textarea: textareaClassNamesConfig,
  select: selectLayoutClassNamesConfig,
  option: optionLayoutClassNamesConfig,
  optionGroup: optionGroupLayoutClassNamesConfig,
  selectPreview: selectPreviewLayoutClassNamesConfig,
  chip: chipLayoutClassNamesConfig,
  chipList: chipListLayoutClassNamesConfig,
  // menu
  menu: menuLayoutClassNamesConfig,
  menuItem: menuItemLayoutClassNamesConfig,
  // divider
  divider: dividerLayoutClassNamesConfig,
  // toggle
  toggle: toggleLayoutClassNamesConfig,
};
