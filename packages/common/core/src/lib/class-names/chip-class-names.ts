import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const chipLayoutClassNamesConfig = {
  prefix: 'cck-chip',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-chip'],
      description: 'It will add to the host element of Chip component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-chip--disabled'],
      description: 'Applied to the host element of the Chip component, when the the chip is disabled',
    },
    removable: {
      name: 'Host Element',
      selectors: ['cck-chip--removable'],
      description: 'Applied to the host element of the Chip component, when the the chip is removable',
    },
    contentWrapper: {
      name: 'Wrapper of content',
      selectors: ['cck-chip__content-wrapper'],
      description: 'It will add to the wrapper of content element.',
    },
    removeIconWrapper: {
      name: 'Wrapper of remove icon',
      selectors: ['cck-chip__remove-icon-wrapper'],
      description: 'It will add to the wrapper of remove icon element.',
    },
  },
};

export function getChipClassNames(
  componentProps: UIBaseComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof chipLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'chip',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...chipLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(chipLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...chipLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    removable: [...chipLayoutClassNamesConfig.elements.removable.selectors].join(' '),
    contentWrapper: [...chipLayoutClassNamesConfig.elements.contentWrapper.selectors].join(' '),
    removeIconWrapper: [...chipLayoutClassNamesConfig.elements.removeIconWrapper.selectors].join(' '),
  };
}
