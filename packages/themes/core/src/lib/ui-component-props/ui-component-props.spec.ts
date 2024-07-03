import { describe, expect, it } from 'vitest';

import { DeepPartial } from '@cocokits/common-types';
import { deepClone, deepMerge } from '@cocokits/common-utils';

import { validateUiComponentProps } from './ui-component-props';

const DEFAULT_CONFIG = {
  componentName: 'component1',
  componentProps: {
    types: 'type2',
    colors: 'color2',
    sizes: 'size2',
  },
  uiComponentsConfig: {
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
};

function getConfigWithDefault(override: DeepPartial<typeof DEFAULT_CONFIG>): any {
  return deepMerge(deepClone(DEFAULT_CONFIG), override);
}

describe('uiComponentParamsValidations', () => {
  it('should throw an error if `UIComponentConfig` has no value', () => {
    const config = getConfigWithDefault({});
    delete config.uiComponentsConfig;

    expect(() => validateUiComponentProps(config)).toThrow(
      `UIComponentConfig' has not provided in the root of application`
    );
  });

  it('should throw an error if the theme does not support the specified component', () => {
    const config = getConfigWithDefault({
      componentName: 'unknownComponent',
    });

    expect(() => validateUiComponentProps(config)).toThrow(
      `This theme does not support the 'unknownComponent' component. Please select a different theme that supports this component or choose from available components: component1`
    );
  });

  it('should throw an error if a required property is not provided', () => {
    const config = getConfigWithDefault({});
    delete config.componentProps.types;

    expect(() => validateUiComponentProps(config)).toThrow(
      "The 'types' property is required for the 'component1' component in this theme but was not provided."
    );
  });

  it('should throw an error if an invalid value is provided for a property', () => {
    const config = getConfigWithDefault({
      componentProps: { colors: 'unknown' },
    });

    expect(() => validateUiComponentProps(config)).toThrow(
      `'unknown' is an invalid value for 'colors' in 'component1'. Accepted values in this theme are: color1, color2`
    );
  });

  it('should not throw an error for valid component properties', () => {
    const config = getConfigWithDefault({});

    expect(() => validateUiComponentProps(config)).not.toThrow();
  });

  it('should not throw an error if optional properties are not provided', () => {
    const config = getConfigWithDefault({});
    delete config.componentProps.colors;

    expect(() => validateUiComponentProps(config)).not.toThrow();
  });
});
