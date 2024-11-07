import { getClassNames, UIBaseComponentProps, UIBaseComponentsName } from '@cocokits/core';
import { ThemeConfigContext } from './context';
import { useContext } from 'react';
import { deepMerge } from '@cocokits/common-utils';

export interface UiBaseComponentConfigOptions<T extends UIBaseComponentsName> {
  componentName: T;
  props: UIBaseComponentProps;
  extraHostElementClassConditions?: { if: boolean | undefined | null; classes: string[] }[];
  skipProps?: {
    skipType?: boolean;
    skipColor?: boolean;
    skipSize?: boolean;
    skipAdditional?: boolean;
  };
}

export function useUiBaseComponentConfig<T extends UIBaseComponentsName>(_options: UiBaseComponentConfigOptions<T>) {
  const themeConfig = useContext(ThemeConfigContext);

  if (!themeConfig) {
    throw new Error(
      'themeConfig context is missing. Please ensure that your component is wrapped with ThemeConfigContext.Provider'
    );
  }

  const options: Required<UiBaseComponentConfigOptions<T>> = deepMerge(_options, {
    extraHostElementClassConditions: [],
    skipProps: {
      skipType: false,
      skipColor: false,
      skipSize: false,
      skipAdditional: false,
    },
  });

  const classNames = getClassNames<T>(
    options.componentName,
    {
      type: options.skipProps.skipType ? null : options.props.type,
      color: options.skipProps.skipColor ? null : options.props.color,
      size: options.skipProps.skipSize ? null : options.props.size,
      additional: options.skipProps.skipAdditional ? undefined : options.props.additional,
    },
    themeConfig
  );

  const hostClassNames = [
    classNames.host,
    ...options.extraHostElementClassConditions.flatMap((condition) => (condition.if ? condition.classes : [])),
  ].join(' ');

  return {
    classNames,
    hostClassNames,
  };
}
