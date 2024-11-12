import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
    opened: {
      name: 'Host Element',
      selectors: ['cck-select--opened'],
      description:
        'It will add to the host element of Select component, when overlay to select an option has been opened',
    },
    closed: {
      name: 'Host Element',
      selectors: ['cck-select--closed'],
      description: 'It will add to the host element of Select component, when overlay to select an option is closed',
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
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof selectLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'select',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...selectLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(selectLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...selectLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    opened: [...selectLayoutClassNamesConfig.elements.opened.selectors].join(' '),
    closed: [...selectLayoutClassNamesConfig.elements.closed.selectors].join(' '),
    multiple: [...selectLayoutClassNamesConfig.elements.multiple.selectors].join(' '),
    single: [...selectLayoutClassNamesConfig.elements.single.selectors].join(' '),
    placeholder: [...selectLayoutClassNamesConfig.elements.placeholder.selectors].join(' '),
    triggerWrapper: [...selectLayoutClassNamesConfig.elements.triggerWrapper.selectors].join(' '),
    triggerValue: [...selectLayoutClassNamesConfig.elements.triggerValue.selectors].join(' '),
    dropdownIconWrapper: [...selectLayoutClassNamesConfig.elements.dropdownIconWrapper.selectors].join(' '),
    optionsWrapper: [...selectLayoutClassNamesConfig.elements.optionsWrapper.selectors].join(' '),
    overlay: [...selectLayoutClassNamesConfig.elements.overlay.selectors].join(' '),
  };
}
