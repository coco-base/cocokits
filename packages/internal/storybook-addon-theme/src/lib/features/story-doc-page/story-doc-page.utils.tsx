import { PreparedMeta, PreparedStory } from '@storybook/types';

import { ClassRef } from '@cocokits/core';

import { StoryDocPageAPIProps } from './story-doc-page-api';
import { getArgTypesApiList } from './story-doc-page-api.utils';
import { StoryDocPageOverviewProps } from './story-doc-page-overview';
import { StoryDocPageStylingComponent, StoryDocPageStylingProps } from './story-doc-page-styling';
import { AddonParameters } from '../../model/addon.model';
import { ThemeChangeEvent } from '../../model/event.model';

// Overview
export function getOverviewProps(
  metaParameters: AddonParameters,
  stories: PreparedStory[],
  theme: ThemeChangeEvent
): StoryDocPageOverviewProps {
  const metaDescription = metaParameters.docs?.description?.component;
  const componentName = metaParameters.cckAddon?.componentName!;

  const flitteredStories = stories.filter((story) => {
    const storyParameters = story.parameters as AddonParameters;
    const renderConditions = storyParameters.cckAddon?.renderConditions ?? [];

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

export function getApiProps(preparedMeta: PreparedMeta, theme: ThemeChangeEvent): StoryDocPageAPIProps {
  return {
    argTypes: getArgTypesApiList(preparedMeta, theme.themeConfig),
    themeName: theme.displayName,
  };
}

// Styling
export function getStylingProps(preparedMeta: PreparedMeta, parameters: AddonParameters): StoryDocPageStylingProps {
  const mainUiBaseComponentName = parameters.cckAddon?.componentName;
  const mainComponentName = (preparedMeta.component as ClassRef).name;

  if (!mainUiBaseComponentName) {
    throw new Error(`Component name is missing in the story parameters for story ID: ${preparedMeta.id}`);
  }
  if (!mainComponentName) {
    throw new Error(`Component is not a class ref in the story parameters for story ID: ${preparedMeta.id}`);
  }

  // Type of storybook is wrong, so we have to change it
  const subcomponentsRef = preparedMeta.subcomponents as unknown as ClassRef[] | undefined;

  const subcomponents: StoryDocPageStylingComponent[] =
    subcomponentsRef
      ?.filter((subcomponentRef) => {
        return !(
          subcomponentRef.name.startsWith('_') ||
          // Not all subcomponents are part of UIBaseComponents (e.g., MenuTriggerDirective).
          // If a component has the value 'null', we skip it because it has no styling.
          parameters.cckAddon?.subcomponentNames?.[subcomponentRef.name] === null
        );
      })
      .map((subcomponentRef) => {
        const uIBaseComponentName = parameters.cckAddon?.subcomponentNames?.[subcomponentRef.name];
        if (!uIBaseComponentName) {
          throw new Error(
            `Subcomponent name is missing in the story parameters for story ID: ${preparedMeta.id}/${subcomponentRef.name}`
          );
        }

        return {
          uIBaseComponentName,
          componentName: subcomponentRef.name,
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
