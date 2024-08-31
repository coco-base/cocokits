import { isNotNullish, recordForEach } from '@cocokits/common-utils';

import { getCheckboxClassNames } from './checkbox-class-names';
import { cssSelectorRender } from './css-selector-render';
import { getErrorClassNames } from './error-class-names';
import { getFormFieldClassNames } from './form-field-class-names';
import { getHintClassNames } from './hint-class-names';
import { getIconButtonClassNames } from './icon-button-class-names';
import { getSvgIconClassNames } from './icon-class-names';
import { getInputClassNames } from './input-class-names';
import { getLabelClassNames } from './label-class-names';
import { getLeadingClassNames } from './leading-class-names';
import { getPrefixClassNames } from './prefix-class-names';
import { getRadioButtonClassNames } from './radio-button-class-names';
import { getRadioGroupClassNames } from './radio-group-class-names';
import { getSuffixClassNames } from './suffix-class-names';
import { getTrailingClassNames } from './trailing-class-names';
import {
  ThemeUIComponentProps,
  ThemeUIComponentsConfig,
  ThemeUIComponentsOptions,
  UIComponentsName,
} from '../model/ui-component.model';
import { getComponentPropsWithDefault } from '../ui-component-props/ui-component-props';
import { getTextareaClassNames } from './textarea-class-names';
import { getSelectClassNames } from './select-class-names';
import { getOptionClassNames } from './option-class-names';
import { getOptionGroupClassNames } from './option-group-class-names';
import { getSelectPreviewClassNames } from './select-preview-class-names';
import { getButtonClassNames } from './button-class-names';
import { getChipClassNames } from './chip-class-names';
import { getChipListClassNames } from './chip-list-class-names';
import { getMenuClassNames } from './menu-class-names';
import { getMenuItemClassNames } from './menu-item-class-names';
import { getMenuGroupClassNames } from './menu-group-class-names';
import { getDividerClassNames } from './divider-class-names';

export const CLASS_NAMES_FN_MAP = {
  // formField
  formField: getFormFieldClassNames,
  label: getLabelClassNames,
  error: getErrorClassNames,
  hint: getHintClassNames,
  prefix: getPrefixClassNames,
  suffix: getSuffixClassNames,
  trailing: getTrailingClassNames,
  leading: getLeadingClassNames,
  input: getInputClassNames,
  textarea: getTextareaClassNames,
  select: getSelectClassNames,
  option: getOptionClassNames,
  optionGroup: getOptionGroupClassNames,
  selectPreview: getSelectPreviewClassNames,
  chip: getChipClassNames,
  chipList: getChipListClassNames,

  // menu
  menu: getMenuClassNames,
  menuItem: getMenuItemClassNames,
  menuGroup: getMenuGroupClassNames,

  // divider
  divider: getDividerClassNames,

  // radio
  radioButton: getRadioButtonClassNames,
  radioGroup: getRadioGroupClassNames,

  // checkbox
  checkbox: getCheckboxClassNames,

  // button
  button: getButtonClassNames,
  iconButton: getIconButtonClassNames,

  // icon
  svgIcon: getSvgIconClassNames,
};

export function getClassNames<T extends UIComponentsName>(
  componentName: T,
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): ReturnType<(typeof CLASS_NAMES_FN_MAP)[T]> {
  return CLASS_NAMES_FN_MAP[componentName](componentProps, uiComponentsConfig) as ReturnType<
    (typeof CLASS_NAMES_FN_MAP)[T]
  >;
}

export function getHostClassNames(prefix: string, options: ThemeUIComponentsOptions) {
  const classNames = [];

  const { type, color, size, additional } = getComponentPropsWithDefault(options);

  if (isNotNullish(type)) {
    classNames.push(cssSelectorRender({ block: prefix, element: type }));
  }
  if (isNotNullish(type) && options.componentProps.type !== type) {
    classNames.push(cssSelectorRender({ block: prefix, modifier: 'default-type' }));
  }

  if (color) {
    classNames.push(cssSelectorRender({ block: prefix, element: 'color', modifier: color }));
  }
  if (color && options.componentProps.color !== color) {
    classNames.push(cssSelectorRender({ block: prefix, modifier: 'default-color' }));
  }

  if (size) {
    classNames.push(cssSelectorRender({ block: prefix, element: 'size', modifier: size }));
  }
  if (size && options.componentProps.size !== size) {
    classNames.push(cssSelectorRender({ block: prefix, modifier: 'default-size' }));
  }

  if (additional) {
    recordForEach(additional, (value, key) => {
      classNames.push(cssSelectorRender({ block: prefix, element: key, modifier: value }));
    });
  }

  return classNames;
}
