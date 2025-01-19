import { PreparedStory } from '@storybook/types';

import { toTitleCase } from '@cocokits/common-utils';

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

    if (isThemeConfig && control.prop === 'type' && themeComponentConfig.type) {
      return [
        {
          type: AddonParametersControlType.Select,
          displayName: toTitleCase(themeComponentConfig.type.name),
          storyArgKey: themeComponentConfig.type.name,
          default: themeComponentConfig.type.default.toString(),
          options: themeComponentConfig.type.values.map((value) => value.toString()),
        },
      ] satisfies AddonParametersControlSelect[];
    }

    if (isThemeConfig && control.prop === 'color' && themeComponentConfig.color) {
      return [
        {
          type: AddonParametersControlType.Select,
          displayName: toTitleCase(themeComponentConfig.color.name),
          storyArgKey: themeComponentConfig.color.name,
          default: themeComponentConfig.color.default.toString(),
          options: themeComponentConfig.color.values.map((value) => value.toString()),
        },
      ] satisfies AddonParametersControlSelect[];
    }

    if (isThemeConfig && control.prop === 'size' && themeComponentConfig.size) {
      return [
        {
          type: AddonParametersControlType.Select,
          displayName: toTitleCase(themeComponentConfig.size.name),
          storyArgKey: themeComponentConfig.size.name,
          default: themeComponentConfig.size.default.toString(),
          options: themeComponentConfig.size.values.map((value) => value.toString()),
        },
      ] satisfies AddonParametersControlSelect[];
    }

    if (isThemeConfig && control.prop === 'additional' && themeComponentConfig.additional) {
      return Object.values(themeComponentConfig.additional).map((prop) => {
        return typeof prop.default === 'boolean'
          ? ({
              type: AddonParametersControlType.Boolean,
              displayName: toTitleCase(prop.name),
              storyArgKey: prop.name,
              default: prop.default,
            } satisfies AddonParametersControlBoolean)
          : ({
              type: AddonParametersControlType.Select,
              displayName: toTitleCase(prop.name),
              storyArgKey: prop.name,
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
