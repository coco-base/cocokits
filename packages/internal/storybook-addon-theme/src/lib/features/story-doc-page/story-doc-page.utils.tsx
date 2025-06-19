import { PreparedMeta, PreparedStory } from '@storybook/types';

import { StoryDocPageAPIProps } from './story-doc-page-api';
import { getArgTypesApiList } from './story-doc-page-api.utils';
import { StoryDocPageOverviewProps } from './story-doc-page-overview';
import { StoryDocPageStylingComponent, StoryDocPageStylingProps } from './story-doc-page-styling';
import { AddonParameters, AddonThemeConfig, ComponentRef } from '../../model/addon.model';
import { ThemeChangeEvent } from '../../model/event.model';
import { getStoryComponentName } from '../../utils/get-story-parameters';

// Overview
export function getOverviewProps(
  metaParameters: AddonParameters,
  stories: PreparedStory[],
  theme: ThemeChangeEvent
): StoryDocPageOverviewProps {
  const metaDescription = metaParameters.docs.description.component;
  const componentName = metaParameters.cckAddon.componentName;

  const flitteredStories = stories.filter((story) => {
    const storyParameters = story.parameters as AddonParameters;
    const renderConditions = storyParameters.cckAddon.renderConditions ?? [];

    return renderConditions.every((conditionFn) =>
      conditionFn({
        docPageTab: 'Overview',
        theme: theme,
        themeComponentConfig: theme.themeConfig.components[componentName],
      })
    );
  });

  return { metaDescription, stories: flitteredStories };
}

// API

export function getApiProps(
  preparedMeta: PreparedMeta,
  theme: ThemeChangeEvent,
  framework: AddonThemeConfig['framework']
): StoryDocPageAPIProps {
  return {
    argTypes: getArgTypesApiList(preparedMeta, theme.themeConfig, framework),
    themeName: theme.displayName,
    ngTemplateMD: (preparedMeta.parameters as AddonParameters).cckAddon.ngTemplateMarkdown ?? null,
  };
}

// Styling
export function getStylingProps(preparedMeta: PreparedMeta, parameters: AddonParameters): StoryDocPageStylingProps {
  const mainUiBaseComponentName = parameters.cckAddon.componentName;
  const mainComponentName = getStoryComponentName(preparedMeta.component, preparedMeta.id);

  if (!mainUiBaseComponentName) {
    throw new Error(`Component name is missing in the story parameters for story ID: ${preparedMeta.id}`);
  }

  // Type of storybook is wrong, so we have to change it
  const subcomponentsRef =
    preparedMeta.subcomponents && Array.isArray(preparedMeta.subcomponents)
      ? ((preparedMeta.subcomponents as unknown as ComponentRef[]) ?? [])
      : Object.values((preparedMeta.subcomponents as Record<string, ComponentRef>) ?? {});

  const subcomponents: StoryDocPageStylingComponent[] =
    subcomponentsRef
      ?.filter((subcomponentRef) => {
        // displayName for react and name for Angular
        const name = subcomponentRef.displayName ?? subcomponentRef.name;
        return !(
          name.startsWith('_') ||
          // Not all subcomponents are part of UIBaseComponents (e.g., MenuTriggerDirective).
          // If a component has the value 'null', we skip it because it has no styling.
          parameters.cckAddon.subcomponents?.[name]?.name === null
        );
      })
      .map((subcomponentRef) => {
        // displayName for react and name for Angular
        const name = subcomponentRef.displayName ?? subcomponentRef.name;
        const uIBaseComponentName = parameters.cckAddon.subcomponents?.[name]?.name;
        if (!uIBaseComponentName) {
          throw new Error(
            `Subcomponent name is missing in the story parameters for story ID: ${preparedMeta.id}/${name}`
          );
        }

        return {
          uIBaseComponentName,
          componentName: name,
        } satisfies StoryDocPageStylingComponent;
      }) ?? [];

  return {
    mainComponent: {
      uIBaseComponentName: mainUiBaseComponentName,
      componentName: mainComponentName,
    },
    subcomponents,
  };
}
