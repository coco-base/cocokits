import { NAVIGATE_URL } from '@storybook/core-events';
import { addons } from '@storybook/preview-api';
import { PreparedStory } from '@storybook/types';

import { CckThemeId } from '@cocokits/storybook-theme-switcher';
import { ThemeUIComponentsConfig, UIComponentsName, UIComponentsPropName } from '@cocokits/theme-core';

import { DocArgTypesList } from '../components/doc-page/DocArgTypes';

export const storyNameToHash = (id: string): string => id.toLowerCase().replace(/[^a-z0-9]/gi, '-');

export const storybookNavigateTo = (url: string) => {
  addons.getChannel().emit(NAVIGATE_URL, url);
};

export const getApiDescription = (themeName: string) =>
  `Please verify that the \`${themeName}\` theme is also applied to your project to ensure consistency,` +
  'or change the theme of this document page to align with your project settings.' +
  'Mismatches between the theme of this document and your project can result in discrepancies in `type`' +
  'definitions and `default` values,' +
  'as themes may vary in their specifications.';

export const getThemeApiDescription = (themeName: string) =>
  'TODO: ....' +
  `Please verify that the \`${themeName}\` theme is also applied to your project to ensure consistency,` +
  'or change the theme of this document page to align with your project settings.' +
  'Mismatches between the theme of this document and your project can result in discrepancies in `type`' +
  'definitions and `default` values,' +
  'as themes may vary in their specifications.';

/**
 * Quick fix: get the real default value from angular signal.
 * Example: `input<BaseColor | null>(BaseColor.Default)` -> `BaseColor.Default`
 * TODO: remove this quick fix, after compoDoc return the value of signal.
 */
export function getValueWithoutSignal(value: string | undefined) {
  if (value?.startsWith('input<')) {
    const match = value.match(/\(([^)]+)\)/);
    if (match) {
      return match[1];
    }
  }

  if (value?.startsWith('InputSignal<')) {
    const match = value.match(/<([^)]+)>/);
    if (match) {
      return match[1];
    }
  }

  return value;
}

export function useArgTypesApiList(
  componentName: UIComponentsName,
  primaryStory: PreparedStory,
  uiComponentsConfig: ThemeUIComponentsConfig
): DocArgTypesList[] {
  const uiComponentConfig = uiComponentsConfig[componentName];

  const argTypesList = Object.values(primaryStory.argTypes)
    .filter((argType) => !argType.table?.disable ?? true)
    .map((argType) => {
      const themeUIComponentProps = uiComponentConfig[argType.name as UIComponentsPropName];

      return {
        name: argType.name,
        description: argType.description,
        defaultValue: themeUIComponentProps?.default ?? getValueWithoutSignal(argType.table?.defaultValue?.summary),
        type: themeUIComponentProps?.values ?? [getValueWithoutSignal(argType.table?.type?.summary)],
      };
    });

  return argTypesList;
}

export function useArgTypesThemeApiList(
  componentName: UIComponentsName,
  uiComponentsConfig: ThemeUIComponentsConfig
): DocArgTypesList[] | null {
  const uiComponentConfig = uiComponentsConfig[componentName];

  if (!uiComponentConfig.additional) {
    return null;
  }

  const argTypesList = Object.values(uiComponentConfig.additional).map((value) => {
    return {
      name: value.name,
      description: value.description,
      defaultValue: value.default ?? '',
      type: value.values,
    };
  });

  return argTypesList;
}

export function getApiSectionConfig(primaryStoryComponentId: string) {
  return { id: `${primaryStoryComponentId}--api`, name: 'API' };
}

export function getThemeApiSectionConfig(primaryStoryComponentId: string) {
  return { id: `${primaryStoryComponentId}--theme-api`, name: 'Theme API' };
}

export function getStoriesTokItems(stories: PreparedStory[], hasThemeAdditionalProps: boolean) {
  const apiTokItem = getApiSectionConfig(stories[0].componentId);
  const themeApiTokItem = getThemeApiSectionConfig(stories[0].componentId);

  const tokItems = stories.map((story) => ({ id: story.id, name: story.name }));
  tokItems.push(apiTokItem);

  if (hasThemeAdditionalProps) {
    tokItems.push(themeApiTokItem);
  }

  return { tokItems, apiTokItem, themeApiTokItem };
}

export function filterStoryByThemeTag(story: PreparedStory, selectedThemeId: CckThemeId) {
  const themeTags = story.tags.filter((tag) => tag.startsWith('theme'));

  const canShowStory = themeTags.length === 0 ? true : themeTags.includes(`theme:${selectedThemeId}`);

  return canShowStory;
}
