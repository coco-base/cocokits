import { NAVIGATE_URL } from '@storybook/core-events';
import { addons } from '@storybook/preview-api';
import { PreparedStory } from '@storybook/types';

import { reduceDeepMerge } from '@cocokits/common-utils';
import { ThemeUIComponentsConfig, UIComponentsName, UIComponentsPropName } from '@cocokits/core';
import { CckThemeChangedEvent, CckThemeId } from '@cocokits/storybook-theme-switcher';

import { DocArgTypesList } from '../components/doc-page/DocArgTypesTable';

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
export function getValueWithoutSignal(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

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
  argTypes: PreparedStory['argTypes'],
  uiComponentsConfig: ThemeUIComponentsConfig
): {
  props: DocArgTypesList[];
  events: DocArgTypesList[];
  methods: DocArgTypesList[];
} {
  const uiComponentConfig = uiComponentsConfig[componentName];
  const order = ['type', 'color', 'size'];

  const argTypesList = Object.values(argTypes).filter((argType) => !argType.table?.disable ?? true);

  const result = reduceDeepMerge(
    argTypesList,
    (argType) => {
      const themeUIComponentProps = uiComponentConfig?.[argType.name as UIComponentsPropName];

      // Skip from ArgsTypeTable when the component has no uiComponentConfig in selected Theme,
      // and it's not force to take from component API
      // eslint-disable-next-line dot-notation
      if (!themeUIComponentProps && order.includes(argType.name) && !argType.table?.['useComponentApi']) {
        return {};
      }

      const keyName =
        argType.table?.category === 'methods' ? 'methods' : argType.table?.category === 'outputs' ? 'events' : 'props';

      const defaultValue =
        keyName === 'props'
          ? themeUIComponentProps?.default ?? getValueWithoutSignal(argType.table?.defaultValue?.summary)
          : undefined;

      return {
        [keyName]: [
          {
            name: argType.name,
            description: argType.description,
            defaultValue,
            type: themeUIComponentProps?.values ?? [getValueWithoutSignal(argType.table?.type?.summary)],
          },
        ],
      };
    },
    {
      props: [] as DocArgTypesList[],
      events: [] as DocArgTypesList[],
      methods: [] as DocArgTypesList[],
    }
  );

  result.props = result.props.sort((a, b) => {
    const aIndex = order.indexOf(a.name);
    const bIndex = order.indexOf(b.name);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) {
      return -1;
    }

    if (bIndex !== -1) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  return result;
}

export function useArgTypesThemeApiList(
  componentName: UIComponentsName,
  uiComponentsConfig: ThemeUIComponentsConfig
): DocArgTypesList[] | null {
  const uiComponentConfig = uiComponentsConfig[componentName];

  // Not all component has uiComponentConfig (such as CDK) or additional configs
  if (!uiComponentConfig?.additional) {
    return null;
  }

  const argTypesList = Object.values(uiComponentConfig.additional).map((value) => {
    return {
      name: `data-cck-${value.name}`,
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

export function filterStoryByScenario(story: PreparedStory, theme: CckThemeChangedEvent): boolean {
  const uiComponentNameTags = story.tags.filter((tag) => tag.startsWith('uiComponentName:'));

  // use story, when no 'uiComponentName' tag has defined.
  if (uiComponentNameTags.length === 0) {
    return true;
  }

  // throw an error when multi 'uiComponentName' exist in story tags
  if (uiComponentNameTags.length > 1) {
    throw new Error(`A story can not have multi 'uiComponentName' tag. The current tags is ${story.tags.join(', ')}`);
  }

  const uiComponentPropNameTags = story.tags.filter((tag) => tag.startsWith('uiComponentPropName:'));

  // use story, when no 'uiComponentPropNameTags' tag has defined.
  if (uiComponentPropNameTags.length === 0) {
    return true;
  }

  // throw an error when multi 'uiComponentName' exist in story tags
  if (uiComponentPropNameTags.length > 1) {
    throw new Error(
      `A story can not have multi 'uiComponentPropNameTags' tag. The current tags is ${story.tags.join(', ')}`
    );
  }

  const uiComponentName = uiComponentNameTags[0].replace('uiComponentName:', '') as UIComponentsName;
  const uiComponentPropName = uiComponentPropNameTags[0].replace('uiComponentPropName:', '') as UIComponentsPropName;

  const themePropConfig = theme.uiComponentConfig[uiComponentName][uiComponentPropName];

  return !!themePropConfig;
}
