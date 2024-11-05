import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const textareaClassNamesConfig = {
  prefix: 'cck-textarea',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-textarea'],
      description: 'It will add to the host element of textarea component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-textarea--disabled'],
      description: 'It will add to the host element of textarea component, the component is disabled',
    },
    autoResize: {
      name: 'Host Element',
      selectors: ['cck-textarea--auto-resize'],
      description:
        'It will add to the host element of textarea component, the the height of textarea will automatically change base on content',
    },
  },
};

export function getTextareaClassNames(
  componentProps: UIBaseComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof textareaClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'textarea',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...textareaClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(textareaClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...textareaClassNamesConfig.elements.disabled.selectors].join(' '),
    autoResize: [...textareaClassNamesConfig.elements.autoResize.selectors].join(' '),
  };
}
