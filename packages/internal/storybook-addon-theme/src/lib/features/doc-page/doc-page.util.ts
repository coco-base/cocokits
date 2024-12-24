import { UIBaseComponentsName, UIBaseComponentsPropName } from '@cocokits/core';
import { PreparedStory } from '@storybook/types';
import { ThemeChangeEvent } from '../../model/event.model';
import { ThemeId } from '../../model/theme.model';

export function scrollToStoryById(storyId: string, offsetTop = 80) {
  const element = document.getElementById(storyId);
  if (!element) {
    return;
  }

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: elementPosition - offsetTop,
    behavior: 'smooth',
  });
}

export function filterStoryByThemeTag(story: PreparedStory, selectedThemeId: ThemeId) {
  const themeTags = story.tags.filter((tag) => tag.startsWith('theme'));

  const canShowStory = themeTags.length === 0 ? true : themeTags.includes(`theme:${selectedThemeId}`);

  return canShowStory;
}

export function filterStoryByScenario(story: PreparedStory, theme: ThemeChangeEvent): boolean {
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

  const themePropConfig = theme.themeConfig.components[uiBaseComponentName]?.[uiBaseComponentPropName];

  return !!themePropConfig;
}
