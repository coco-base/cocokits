import { describe, expect, it } from 'vitest';

import { deepClone, deepMerge } from '@cocokits/common-utils';
import { DeepPartial } from '@cocokits/core';

import { validateUiBaseComponentProps } from './ui-component-props';

const DEFAULT_CONFIG = {
  componentName: 'component1',
  componentProps: {
    types: 'type2',
    colors: 'color2',
    sizes: 'size2',
  },
  themeConfig: {
    components: {
      component1: {
        types: {
          name: 'types',
          values: ['type1', 'type2'],
          require: true,
          default: 'type1',
          description: '',
        },
        colors: {
          name: 'colors',
          values: ['color1', 'color2'],
          require: false,
          default: 'color1',
          description: '',
        },
        sizes: {
          name: 'sizes',
          values: ['size1', 'size2'],
          require: false,
          default: 'size1',
          description: '',
        },
      },
    },
  },
};

function getConfigWithDefault(override: DeepPartial<typeof DEFAULT_CONFIG>): any {
  return deepMerge(deepClone(DEFAULT_CONFIG), override);
}

describe('uiBaseComponentParamsValidations', () => {
  it('should throw an error if `ThemeConfig` has no value', () => {
    const config = getConfigWithDefault({});
    delete config.themeConfig;

    expect(() => validateUiBaseComponentProps(config.componentName, config.componentProps, config.themeConfig)).toThrow(
      `ThemeConfig' has not provided in the root of application`
    );
  });

  it('should throw an error if the theme does not support the specified component', () => {
    const config = getConfigWithDefault({
      componentName: 'unknownComponent',
    });

    expect(() => validateUiBaseComponentProps(config.componentName, config.componentProps, config.themeConfig)).toThrow(
      `This theme does not support the 'unknownComponent' component. Please select a different theme that supports this component or choose from available components: component1`
    );
  });

  it('should throw an error if an invalid value is provided for a property', () => {
    const config = getConfigWithDefault({
      componentProps: { colors: 'unknown' },
    });

    expect(() => validateUiBaseComponentProps(config.componentName, config.componentProps, config.themeConfig)).toThrow(
      `'unknown' is an invalid value for 'colors' in 'component1'. Accepted values in this theme are: color1, color2`
    );
  });

  it('should not throw an error for valid component properties', () => {
    const config = getConfigWithDefault({});

    expect(() =>
      validateUiBaseComponentProps(config.componentName, config.componentProps, config.themeConfig)
    ).not.toThrow();
  });

  it('should not throw an error if optional properties are not provided', () => {
    const config = getConfigWithDefault({});
    delete config.componentProps.colors;

    expect(() =>
      validateUiBaseComponentProps(config.componentName, config.componentProps, config.themeConfig)
    ).not.toThrow();
  });
});
