import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const selectLayoutClassNamesConfig = {
  prefix: 'cck-select',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-select'],
      description: 'It will add to the host element of Select component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-select--disabled'],
      description: 'It will add to the host element of Select component, when the component is disabled',
    },
    multiple: {
      name: 'Host Element',
      selectors: ['cck-select--multiple'],
      description: 'It will add to the host element of Select component, when the selection is multi',
    },
    single: {
      name: 'Host Element',
      selectors: ['cck-select--single'],
      description: 'It will add to the host element of Select component, when the selection is single',
    },
    placeholder: {
      name: 'Placeholder Element',
      selectors: ['cck-select__placeholder'],
      description: 'It will add to the placeholder element of Select component',
    },
    triggerWrapper: {
      name: 'Trigger Wrapper Element',
      selectors: ['cck-select__trigger-wrapper'],
      description: 'It will add to the element that wrap placeholder, triggerPreview and triggerValue',
    },
    triggerValue: {
      name: 'Trigger Value Element',
      selectors: ['cck-select__trigger-value'],
      description: 'It will add to the element that contains triggerPreview or triggerValue',
    },
    dropdownIconWrapper: {
      name: 'Dropdown Icon Wrapper Element',
      selectors: ['cck-select__dropdown-icon-wrapper'],
      description: 'It will add to the element that contains the dropdown icon',
    },
    optionsWrapper: {
      name: 'Options Wrapper Element',
      selectors: ['cck-select__options-wrapper'],
      description: 'It will add to the options wrapper element that contains the options and optionGroup',
    },
    overlay: {
      name: 'Options Overlay Element',
      selectors: ['cck-select__overlay'],
      description: 'It will add to the overlay element, the the selection overlay is opened',
    },
  },
};

export function getSelectClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof selectLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'select',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...selectLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(selectLayoutClassNamesConfig.prefix, options),
    ],
    disabled: [...selectLayoutClassNamesConfig.elements.disabled.selectors],
    multiple: [...selectLayoutClassNamesConfig.elements.multiple.selectors],
    single: [...selectLayoutClassNamesConfig.elements.single.selectors],
    placeholder: [...selectLayoutClassNamesConfig.elements.placeholder.selectors],
    triggerWrapper: [...selectLayoutClassNamesConfig.elements.triggerWrapper.selectors],
    triggerValue: [...selectLayoutClassNamesConfig.elements.triggerValue.selectors],
    dropdownIconWrapper: [...selectLayoutClassNamesConfig.elements.dropdownIconWrapper.selectors],
    optionsWrapper: [...selectLayoutClassNamesConfig.elements.optionsWrapper.selectors],
    overlay: [...selectLayoutClassNamesConfig.elements.overlay.selectors],
  };
}
