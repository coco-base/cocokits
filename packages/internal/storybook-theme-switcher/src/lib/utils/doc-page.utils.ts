import { NAVIGATE_URL } from '@storybook/core-events';
import { addons } from '@storybook/preview-api';
import { PreparedStory } from '@storybook/types';

import { reduceDeepMerge } from '@cocokits/common-utils';
import { UIBaseComponentsName, UIBaseComponentsPropName, ThemeConfig } from '@cocokits/core';
import { CckThemeChangedEvent, CckThemeId } from '@cocokits/storybook-theme-switcher';

import {
  transformArgTypeCategory,
  transformArgTypeDefaultValue,
  transformArgTypeName,
  transformArgTypeType,
} from './args-type-transform.utils';
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
export function getValueWithoutSignal(value: any): string {
  if (typeof value !== 'string') {
    return value as string;
  }

  if (value?.startsWith('input<')) {
    const match = value.match(/\(([^)]+)\)/);
    if (match) {
      return match[1];
    }
  }
  if (value?.startsWith('input(undefined, { transform:')) {
    return '';
  }

  if (value?.startsWith('InputSignal<') || value?.startsWith('ModelSignal<')) {
    const match = value.match(/<([^)]+)>/);
    if (match) {
      return match[1];
    }
  }

  return value.toString();
}

// eslint-disable-next-line max-lines-per-function
export function useArgTypesApiList(
  componentName: UIBaseComponentsName,
  argTypes: PreparedStory['argTypes'],
  themeConfig: ThemeConfig
): {
  props: DocArgTypesList[];
  events: DocArgTypesList[];
  methods: DocArgTypesList[];
} {
  // Not all components/Directive has argTypes. For example `MenuTriggerDirective`
  if (!argTypes) {
    return {
      props: [] as DocArgTypesList[],
      events: [] as DocArgTypesList[],
      methods: [] as DocArgTypesList[],
    };
  }

  const themeComponentConfig = themeConfig.components[componentName];
  const order = ['type', 'color', 'size'];

  const argTypesList = Object.values(argTypes).filter((argType) => !argType.table?.disable);

  const result = reduceDeepMerge(
    argTypesList,
    (argType) => {
      const name = transformArgTypeName(argType);
      /**
       * Because of out custom structure in storybook argTypes to show all argsTypes and not only the compodoc types,
       * sometimes the argType is subcomponent object and the name wil be 'undefined'.
       * In that case we have to skip it from argTypes table
       */
      if (!name) {
        return {};
      }
      const themeBaseComponentProps = themeComponentConfig?.[name as UIBaseComponentsPropName] ?? null;

      // Skip from ArgsTypeTable when the component has no themeConfig in selected Theme,
      // and it's not force to take from component API
      // Example of force: the type of input component is not our custom config, it's the native type of input such as 'number' or 'date'
      // eslint-disable-next-line dot-notation
      if (!themeBaseComponentProps && order.includes(name) && !argType.table?.['useComponentApi']) {
        return {};
      }

      // Skip public methods or properties that start with `_`.
      if (name.startsWith('_')) {
        return {};
      }

      const category = transformArgTypeCategory(argType);
      const defaultValue = transformArgTypeDefaultValue(category, themeBaseComponentProps, argType);
      const type = transformArgTypeType(themeBaseComponentProps, argType);

      return {
        [category]: [
          {
            name: name,
            description: argType.description,
            defaultValue,
            type,
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
  componentName: UIBaseComponentsName,
  themeConfig: ThemeConfig
): DocArgTypesList[] | null {
  const themeComponentConfig = themeConfig.components[componentName];

  // Not all component has themeConfig (such as CDK) or additional configs
  if (!themeComponentConfig?.additional) {
    return null;
  }

  const argTypesList = Object.values(themeComponentConfig.additional).map((value) => {
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
  const uiBaseComponentNameTags = story.tags.filter((tag) => tag.startsWith('uiBaseComponentName:'));

  // use story, when no 'uiBaseComponentName' tag has defined.
  if (uiBaseComponentNameTags.length === 0) {
    return true;
  }

  // throw an error when multi 'uiBaseComponentName' exist in story tags
  if (uiBaseComponentNameTags.length > 1) {
    throw new Error(
      `A story can not have multi 'uiBaseComponentName' tag. The current tags is ${story.tags.join(', ')}`
    );
  }

  const uiBaseComponentPropNameTags = story.tags.filter((tag) => tag.startsWith('uiBaseComponentPropName:'));

  // use story, when no 'uiBaseComponentPropNameTags' tag has defined.
  if (uiBaseComponentPropNameTags.length === 0) {
    return true;
  }

  // throw an error when multi 'uiBaseComponentName' exist in story tags
  if (uiBaseComponentPropNameTags.length > 1) {
    throw new Error(
      `A story can not have multi 'uiBaseComponentPropNameTags' tag. The current tags is ${story.tags.join(', ')}`
    );
  }

  const uiBaseComponentName = uiBaseComponentNameTags[0].replace('uiBaseComponentName:', '') as UIBaseComponentsName;
  const uiBaseComponentPropName = uiBaseComponentPropNameTags[0].replace(
    'uiBaseComponentPropName:',
    ''
  ) as UIBaseComponentsPropName;

  const themePropConfig = theme.themeConfig.components[uiBaseComponentName][uiBaseComponentPropName];

  return !!themePropConfig;
}
