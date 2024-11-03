import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const labelLayoutClassNamesConfig = {
  prefix: 'cck-label',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-label'],
      description: 'It will add to the host element of Label component.',
    },
    labelTag: {
      name: 'Label Element',
      selectors: ['cck-label__label-tag'],
      description: 'It will add to the `label` element of html tag',
    },
    requiredMarker: {
      name: 'Required Marker Element',
      selectors: ['cck-label__required-marker'],
      description:
        'It will add to the to the required marker element, when the `hideRequiredMarker` of `FormField` component is `false`. It will show the `*` at end of label text',
    },
  },
};

export function getLabelClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof labelLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'label',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...labelLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(labelLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    labelTag: [...labelLayoutClassNamesConfig.elements.labelTag.selectors].join(' '),
    requiredMarker: [...labelLayoutClassNamesConfig.elements.requiredMarker.selectors].join(' '),
  };
}
