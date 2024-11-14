import { isNotNullish, recordForEach, safeMergeString } from '@cocokits/common-utils';

import { getButtonClassNames } from './button-class-names';
import { getCheckboxClassNames } from './checkbox-class-names';
import { getChipClassNames } from './chip-class-names';
import { getChipListClassNames } from './chip-list-class-names';
import { cssSelectorRender } from './css-selector-render';
import { getDividerClassNames } from './divider-class-names';
import { getErrorClassNames } from './error-class-names';
import { getFormFieldClassNames } from './form-field-class-names';
import { getHintClassNames } from './hint-class-names';
import { getIconButtonClassNames } from './icon-button-class-names';
import { getSvgIconClassNames } from './icon-class-names';
import { getInputClassNames } from './input-class-names';
import { getLabelClassNames } from './label-class-names';
import { getLeadingClassNames } from './leading-class-names';
import { getMenuClassNames } from './menu-class-names';
import { getMenuItemClassNames } from './menu-item-class-names';
import { getOptionClassNames } from './option-class-names';
import { getOptionGroupClassNames } from './option-group-class-names';
import { getPrefixClassNames } from './prefix-class-names';
import { getRadioButtonClassNames } from './radio-button-class-names';
import { getRadioGroupClassNames } from './radio-group-class-names';
import { getSelectClassNames } from './select-class-names';
import { getSelectPreviewClassNames } from './select-preview-class-names';
import { getSuffixClassNames } from './suffix-class-names';
import { getTextareaClassNames } from './textarea-class-names';
import { getToggleClassNames } from './toggle-class-names';
import { getTrailingClassNames } from './trailing-class-names';
import {
  UIBaseComponentProps,
  CssSelectorGeneratorOptions,
  UIBaseComponentsName,
  ThemeConfig,
  LayoutClassNamesConfig,
} from '../model/theme-config.model';
import { getComponentPropsWithDefault } from '../ui-component-props/ui-component-props';

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

  // divider
  divider: getDividerClassNames,

  // toggle
  toggle: getToggleClassNames,

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

export function getClassNames<T extends UIBaseComponentsName>(
  componentName: T,
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): ReturnType<(typeof CLASS_NAMES_FN_MAP)[T]> {
  return CLASS_NAMES_FN_MAP[componentName](componentProps, themeConfig) as ReturnType<(typeof CLASS_NAMES_FN_MAP)[T]>;
}

export function getHostClassNamesFromProps(
  layoutConfig: LayoutClassNamesConfig,
  themeConfig: ThemeConfig,
  componentProps: UIBaseComponentProps
) {
  const classNames = [];

  const { type, color, size, additional } = getComponentPropsWithDefault(layoutConfig, themeConfig, componentProps);
  const block = safeMergeString(
    layoutConfig.baseSelectorStructure.block,
    ...layoutConfig.elements.host.selectorStructure.map((s) => s.block)
  );

  if (isNotNullish(type)) {
    classNames.push(cssSelectorRender({ block, element: type, themePrefix: themeConfig.cssSelectorPrefix }));
  }
  if (isNotNullish(type) && componentProps.type !== type) {
    classNames.push(cssSelectorRender({ block, modifier: 'default-type', themePrefix: themeConfig.cssSelectorPrefix }));
  }

  if (color) {
    classNames.push(
      cssSelectorRender({ block, element: 'color', modifier: color, themePrefix: themeConfig.cssSelectorPrefix })
    );
  }
  if (color && componentProps.color !== color) {
    classNames.push(
      cssSelectorRender({ block, modifier: 'default-color', themePrefix: themeConfig.cssSelectorPrefix })
    );
  }

  if (size) {
    classNames.push(
      cssSelectorRender({ block, element: 'size', modifier: size, themePrefix: themeConfig.cssSelectorPrefix })
    );
  }
  if (size && componentProps.size !== size) {
    classNames.push(cssSelectorRender({ block, modifier: 'default-size', themePrefix: themeConfig.cssSelectorPrefix }));
  }

  if (additional) {
    recordForEach(additional, (value, key) => {
      classNames.push(
        cssSelectorRender({ block, element: key, modifier: value, themePrefix: themeConfig.cssSelectorPrefix })
      );
    });
  }

  return classNames;
}

export function generateLayoutClassNameFromElement<T extends LayoutClassNamesConfig, U extends keyof T['elements']>(
  layoutConfig: T,
  key: U,
  themeConfig: ThemeConfig
): string;
export function generateLayoutClassNameFromElement<T extends LayoutClassNamesConfig, U extends 'host'>(
  layoutConfig: T,
  key: U,
  themeConfig: ThemeConfig,
  componentProps: UIBaseComponentProps
): string;
export function generateLayoutClassNameFromElement<T extends LayoutClassNamesConfig, U extends keyof T['elements']>(
  layoutConfig: T,
  elementName: U,
  themeConfig: ThemeConfig,
  componentProps?: UIBaseComponentProps
) {
  const elementConfig = layoutConfig.elements[elementName as string];

  const classNames = [
    cssSelectorRender({
      themePrefix: themeConfig.cssSelectorPrefix,
      block: safeMergeString(
        layoutConfig.baseSelectorStructure.block,
        ...elementConfig.selectorStructure.map((s) => s.block)
      ),
      element: safeMergeString(
        layoutConfig.baseSelectorStructure.element,
        ...elementConfig.selectorStructure.map((s) => s.element)
      ),
      modifier: safeMergeString(
        layoutConfig.baseSelectorStructure.modifier,
        ...elementConfig.selectorStructure?.map((s) => s.modifier)
      ),
    }),
  ];

  if (elementName === 'host') {
    if (!componentProps) {
      throw new Error('componentProps is required when elementName is host by generating class names');
    }

    classNames.push(...getHostClassNamesFromProps(layoutConfig, themeConfig, componentProps));
  }

  return classNames.join(' ');
}
