import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const optionLayoutClassNamesConfig = {
  prefix: 'cck-option',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-option'],
      description: 'It will add to the host element of Option component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-option--disabled'],
      description: 'It will add to the host element of Option component, the component is disabled',
    },
    selected: {
      name: 'Host Element',
      selectors: ['cck-option--selected'],
      description: 'It will add to the host element of Option component, the option is selected',
    },
    multiple: {
      name: 'Host Element',
      selectors: ['cck-option--multiple'],
      description: 'It will add to the host element of option component, when the selection is multi',
    },
    single: {
      name: 'Host Element',
      selectors: ['cck-option--single'],
      description: 'It will add to the host element of option component, when the selection is single',
    },
    multipleWrapper: {
      name: 'Multiple Wrapper Element',
      selectors: ['cck-option__multiple-wrapper'],
      description:
        'It will add to the multiple wrapper element, and this element will be visible when the select is multiple selection',
    },
    contentWrapper: {
      name: 'Wrapper of content',
      selectors: ['cck-option__content-wrapper'],
      description: 'It will add to the wrapper of option content',
    },
    selectedCheckmark: {
      name: 'Checkmark element',
      selectors: ['cck-option__selected-checkmark'],
      description:
        'It will add to the selected checkmark element, and this element will be visible when the option is selected',
    },
  },
};

export function getOptionClassNames(
  componentProps: UIBaseComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof optionLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'option',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...optionLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(optionLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...optionLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    selected: [...optionLayoutClassNamesConfig.elements.selected.selectors].join(' '),
    multiple: [...optionLayoutClassNamesConfig.elements.multiple.selectors].join(' '),
    single: [...optionLayoutClassNamesConfig.elements.single.selectors].join(' '),
    multipleWrapper: [...optionLayoutClassNamesConfig.elements.multipleWrapper.selectors].join(' '),
    contentWrapper: [...optionLayoutClassNamesConfig.elements.contentWrapper.selectors].join(' '),
    selectedCheckmark: [...optionLayoutClassNamesConfig.elements.selectedCheckmark.selectors].join(' '),
  };
}
