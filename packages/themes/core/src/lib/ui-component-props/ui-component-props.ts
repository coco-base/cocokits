import { hasNotValue, hasValue, sanitizeString } from '@cocokits/common-utils';

import {
  ThemeUIComponentProps,
  ThemeUIComponentPropsConfig,
  ThemeUIComponentPropValue,
  ThemeUIComponentsOptions,
  UIComponentsPropName,
} from '../model/ui-component.model';

export function validateUiComponentProps({
  componentName,
  componentProps,
  uiComponentsConfig,
}: ThemeUIComponentsOptions) {
  if (!uiComponentsConfig) {
    throw new Error(`'UIComponentConfig' has not provided in the root of application`);
  }

  const componentConfig = uiComponentsConfig[componentName];

  // 1- Check if the theme supports the specified component
  if (!componentConfig) {
    const validComponents = Object.keys(uiComponentsConfig).join(', ');
    throw new Error(
      `This theme does not support the '${componentName}' component. Please select a different theme that supports this component or choose from available components: ${validComponents}`
    );
  }

  // Validate properties provided for the component against theme configuration
  Object.entries(componentConfig).forEach((entry) => {
    const propName = entry[0] as UIComponentsPropName;
    const propConfig = entry[1] as ThemeUIComponentPropsConfig | null;
    const componentPropValue = sanitizeString(componentProps[propName]);

    // 2- Check unsupported properties
    if (propConfig === null) {
      if (hasValue(componentProps[propName])) {
        const validProps = Object.values(componentConfig)
          .filter((config) => !!config)
          .join(', ');
        throw new Error(
          `The '${componentName}' component does not support the '${propName}' property in this theme. Valid properties include: ${validProps}`
        );
      }

      return;
    }

    // 3- Check required properties are provided
    if (propConfig.require && hasNotValue(componentPropValue)) {
      throw new Error(
        `The '${propName}' property is required for the '${componentName}' component in this theme but was not provided.`
      );
    }

    // 4- Check for valid values if the property is configured to accept specific values
    if (hasValue(componentPropValue) && !propConfig.values.includes(componentPropValue as ThemeUIComponentPropValue)) {
      throw new Error(
        `'${componentPropValue}' is an invalid value for '${propName}' in '${componentName}'. Accepted values in this theme are: ${propConfig.values.join(
          ', '
        )}`
      );
    }
  });
}

export function getComponentPropsWithDefault({
  componentName,
  componentProps,
  uiComponentsConfig,
}: ThemeUIComponentsOptions): ThemeUIComponentProps {
  console.log('COLOR', componentProps.color, typeof componentProps.color);
  return {
    type: componentProps.type ?? uiComponentsConfig?.[componentName].type?.default,
    color:
      componentProps.color === null ? null : componentProps.color || uiComponentsConfig?.[componentName].color?.default,
    size:
      componentProps.size === null ? null : componentProps.size || uiComponentsConfig?.[componentName].size?.default,
  };
}
