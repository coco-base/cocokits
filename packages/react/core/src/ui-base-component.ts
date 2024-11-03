import { getClassNames, ThemeUIComponentProps, UIComponentsName } from '@cocokits/core';
import { UiComponentConfig } from './context';
import { useContext } from 'react';
import { deepMerge } from '@cocokits/common-utils';

export interface UiBaseComponentConfigOptions<T extends UIComponentsName> {
  componentName: T;
  props: ThemeUIComponentProps;
  extraHostElementClassConditions?: { if: boolean | undefined | null; classes: string[] }[];
  skipProps?: {
    skipType?: boolean;
    skipColor?: boolean;
    skipSize?: boolean;
    skipAdditional?: boolean;
  };
}

export function useUiBaseComponentConfig<T extends UIComponentsName>(_options: UiBaseComponentConfigOptions<T>) {
  const uiComponentConfig = useContext(UiComponentConfig);

  if (!uiComponentConfig) {
    throw new Error(
      'UiComponentConfig context is missing. Please ensure that your component is wrapped with UiComponentConfig.Provider'
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
    uiComponentConfig
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
