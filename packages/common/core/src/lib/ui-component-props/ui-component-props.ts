import { hasValue, isNotNullish, recordReduceMerge, sanitizeValue } from '@cocokits/common-utils';

import {
  LayoutClassNamesConfig,
  ThemeComponentPropertyConfig,
  ThemeConfig,
  UIBaseComponentProps,
  UIBaseComponentsName,
  UIBaseComponentsPropName,
  UIBaseComponentsPropValue,
} from '../model/theme-config.model';

// eslint-disable-next-line max-lines-per-function
export function validateUiBaseComponentProps(
  componentName: UIBaseComponentsName,
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
) {
  if (!themeConfig) {
    throw new Error(`'ThemeConfig' has not provided in the root of application`);
  }

  const componentConfig = themeConfig.components[componentName];

  // 1- Check if the theme supports the specified component
  if (!componentConfig) {
    const validComponents = Object.keys(themeConfig.components).join(', ');
    throw new Error(
      `This theme does not support the '${componentName}' component. Please select a different theme that supports this component or choose from available components: ${validComponents}`
    );
  }

  // Validate properties provided for the component against theme configuration
  // TODO: Duplicate code. merge it with `Object.entries` at bottom
  Object.entries(componentConfig)
    .filter((entry) => entry[0] !== 'additional')
    .forEach((entry) => {
      const propName = entry[0] as UIBaseComponentsPropName;
      const propConfig = entry[1] as ThemeComponentPropertyConfig;
      const componentPropValue = sanitizeValue(componentProps[propName]);

      if (
        componentPropValue !== null &&
        componentPropValue !== undefined &&
        typeof componentPropValue !== typeof propConfig?.values[0]
      ) {
        throw new Error(
          `The '${componentName}' component does not support the '${propName}' property as '${typeof componentPropValue}'. Valid type is: ${typeof propConfig
            ?.values[0]}`
        );
      }

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

      // 3- Check for valid values if the property is configured to accept specific values
      if (isNotNullish(componentPropValue) && !propConfig.values.includes(componentPropValue)) {
        throw new Error(
          `'${componentPropValue}' is an invalid value for '${propName}' in '${componentName}'. Accepted values in this theme are: ${propConfig.values.join(
            ', '
          )}`
        );
      }
    });

  // Validate properties provided for the component against theme configuration
  // TODO: Duplicate code. merge it with `Object.entries` at top
  if (componentConfig.additional) {
    Object.entries(componentConfig.additional).forEach((entry) => {
      const propName = entry[0] as UIBaseComponentsPropName;
      const propConfig = entry[1] as ThemeComponentPropertyConfig | null;
      const componentPropValue = sanitizeValue(componentProps[propName]);

      if (
        componentPropValue !== null &&
        componentPropValue !== undefined &&
        typeof componentPropValue !== typeof propConfig?.values[0]
      ) {
        throw new Error(
          `The '${componentName}' component does not support the '${propName}' property as '${typeof componentPropValue}'. Valid type is: ${typeof propConfig
            ?.values[0]}`
        );
      }

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

      // 3- Check for valid values if the property is configured to accept specific values
      if (isNotNullish(componentPropValue) && !propConfig.values.includes(componentPropValue)) {
        throw new Error(
          `'${componentPropValue}' is an invalid value for '${propName}' in '${componentName}'. Accepted values in this theme are: ${propConfig.values.join(
            ', '
          )}`
        );
      }
    });
  }
}

export function getComponentPropsWithDefault(
  layoutConfig: LayoutClassNamesConfig,
  themeConfig: ThemeConfig,
  componentProps: UIBaseComponentProps
): UIBaseComponentProps {
  const additional = recordReduceMerge(
    themeConfig.components?.[layoutConfig.componentName]?.additional ?? {},
    (value, key) => {
      return {
        [key]: valueOrDefault(componentProps.additional?.[key], value?.default),
      };
    }
  );

  return {
    type: valueOrDefault(componentProps.type, themeConfig.components[layoutConfig.componentName]?.type?.default, {
      acceptNull: false,
    }),
    color: valueOrDefault(componentProps.color, themeConfig.components[layoutConfig.componentName]?.color?.default),
    size: valueOrDefault(componentProps.size, themeConfig.components[layoutConfig.componentName]?.size?.default),
    additional,
  };
}

function valueOrDefault(
  value?: UIBaseComponentsPropValue,
  defaultValue?: UIBaseComponentsPropValue,
  { acceptNull = true }: { acceptNull?: boolean } = {}
) {
  if (acceptNull && value === null) {
    return null;
  }

  return hasValue(value) ? value : defaultValue;
}
