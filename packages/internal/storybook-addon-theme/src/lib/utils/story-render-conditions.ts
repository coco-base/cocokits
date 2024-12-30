import { StoryRenderConditionProps } from '../model/addon.model';
import { ThemeId } from '../model/theme.model';
import { UIBaseComponentsPropName } from '@cocokits/core';
import { StoryTab } from '../features/story-doc-page/story-doc-page';

export function renderWithThemeId(themeId: ThemeId): (props: StoryRenderConditionProps) => boolean {
  return (props) => props.theme.id === themeId;
}

export function renderWithThemeProp(
  themePropName: UIBaseComponentsPropName
): (props: StoryRenderConditionProps) => boolean {
  return (props) => !!props.themeComponentConfig?.[themePropName];
}

export function renderWithPageTab(tabName: StoryTab): (props: StoryRenderConditionProps) => boolean {
  return (props) => props.docPageTab === tabName;
}
