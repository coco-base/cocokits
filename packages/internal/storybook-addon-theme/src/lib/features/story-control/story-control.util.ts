/* eslint-disable complexity */
import { PreparedStory } from '@storybook/types';

import { toCamelCase, toTitleCase } from '@cocokits/common-utils';

import {
  AddonParameters,
  AddonParametersControl,
  AddonParametersControlBoolean,
  AddonParametersControlSelect,
  AddonParametersControlTheme,
  AddonParametersControlType,
} from '../../model/addon.model';
import { ThemeChangeEvent } from '../../model/event.model';

export function getStoryControls(story: PreparedStory, theme: ThemeChangeEvent) {
  const parameters = story.parameters as AddonParameters;
  const uiBaseComponentName = parameters.cckAddon.componentName;
  const controls = parameters.cckAddon.controls ?? [];

  if (!uiBaseComponentName) {
    throw new Error(`Component name is missing in the story parameters for story ID: ${story.id}`);
  }

  const themeComponentConfig = theme.themeConfig.components[uiBaseComponentName];

  if (!themeComponentConfig) {
    throw new Error(`${theme.displayName} has no config for ${uiBaseComponentName}`);
  }

  const args: Exclude<AddonParametersControl, AddonParametersControlTheme>[] = controls.flatMap((control) => {
    const isThemeConfig = control.type === AddonParametersControlType.SelectThemeConfig;
    const targetThemeComponentConfig =
      isThemeConfig && control.subComponentName
        ? theme.themeConfig.components[control.subComponentName]
        : themeComponentConfig;

    if (isThemeConfig && control.prop === 'type' && targetThemeComponentConfig?.type) {
      return [
        {
          type: AddonParametersControlType.Select,
          displayName: toTitleCase(`${control.subComponentName ?? ''} ${targetThemeComponentConfig.type.name}`),
          storyArgKey: toCamelCase(`${control.subComponentName ?? ''} ${targetThemeComponentConfig.type.name}`),
          default: targetThemeComponentConfig.type.default.toString(),
          options: targetThemeComponentConfig.type.values.map((value) => value.toString()),
        },
      ] satisfies AddonParametersControlSelect[];
    }

    if (isThemeConfig && control.prop === 'color' && targetThemeComponentConfig?.color) {
      return [
        {
          type: AddonParametersControlType.Select,
          displayName: toTitleCase(`${control.subComponentName ?? ''} ${targetThemeComponentConfig.color.name}`),
          storyArgKey: toCamelCase(`${control.subComponentName ?? ''} ${targetThemeComponentConfig.color.name}`),
          default: targetThemeComponentConfig.color.default.toString(),
          options: targetThemeComponentConfig.color.values.map((value) => value.toString()),
        },
      ] satisfies AddonParametersControlSelect[];
    }

    if (isThemeConfig && control.prop === 'size' && targetThemeComponentConfig?.size) {
      return [
        {
          type: AddonParametersControlType.Select,
          displayName: toTitleCase(`${control.subComponentName ?? ''} ${targetThemeComponentConfig.size.name}`),
          storyArgKey: toCamelCase(`${control.subComponentName ?? ''} ${targetThemeComponentConfig.size.name}`),
          default: targetThemeComponentConfig.size.default.toString(),
          options: targetThemeComponentConfig.size.values.map((value) => value.toString()),
        },
      ] satisfies AddonParametersControlSelect[];
    }

    if (isThemeConfig && control.prop === 'additional' && targetThemeComponentConfig?.additional) {
      return Object.values(targetThemeComponentConfig.additional).map((prop) => {
        return typeof prop.default === 'boolean'
          ? ({
            type: AddonParametersControlType.Boolean,
            displayName: toTitleCase(`${control.subComponentName ?? ''} ${prop.name}`),
            storyArgKey: toCamelCase(`${control.subComponentName ?? ''} ${prop.name}`),
            default: prop.default,
          } satisfies AddonParametersControlBoolean)
          : ({
            type: AddonParametersControlType.Select,
            displayName: toTitleCase(`${control.subComponentName ?? ''} ${prop.name}`),
            storyArgKey: toCamelCase(`${control.subComponentName ?? ''} ${prop.name}`),
            default: prop.default.toString(),
            options: prop.values.map((value) => value.toString()),
          } satisfies AddonParametersControlSelect);
      });
    }

    if (isThemeConfig) {
      return [];
    }

    return [control];
  });

  return args;
}
