import { StrictInputType } from '@storybook/types';

import { ThemeComponentPropertyConfig, UIBaseComponentsPropValue } from '@cocokits/core';

import { getValueWithoutSignal } from './doc-page.utils';

const nameTransformMap: Record<string, string> = {
  _type: 'type',
  _size: 'size',
  _color: 'color',
  _required: 'required',
  _name: 'name',
  _checked: 'checked',
  _disabled: 'disabled',
  menuTemplate: 'cckMenuTrigger',
};

export function transformArgTypeName(argType: StrictInputType): string {
  return nameTransformMap[argType.name] ?? argType.name;
}

export function transformArgTypeCategory(argType: StrictInputType): 'methods' | 'events' | 'props' {
  if (argType.table?.category === 'methods') {
    return 'methods';
  }

  if (argType.table?.category === 'outputs') {
    return 'events';
  }

  return 'props';
}

export function transformArgTypeDefaultValue(
  category: 'methods' | 'events' | 'props',
  themeComponentProps: ThemeComponentPropertyConfig | null,
  argType: StrictInputType
): string | undefined {
  return category === 'props'
    ? themeComponentProps?.default?.toString() ?? getValueWithoutSignal(argType.table?.defaultValue?.summary)
    : undefined;
}

export function transformArgTypeType(
  themeComponentProps: ThemeComponentPropertyConfig | null,
  argType: StrictInputType
): UIBaseComponentsPropValue[] | undefined {
  return themeComponentProps?.values ?? [getValueWithoutSignal(argType.table?.type?.summary)];
}
