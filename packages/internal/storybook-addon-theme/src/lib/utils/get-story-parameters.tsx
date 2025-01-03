import { PreparedStory } from "@storybook/types";

import { isClassRef } from "./common.utils";
import { AddonParameters } from "../model/addon.model";
import { ThemeChangeEvent } from "../model/event.model";

export function getStoryParameters(story: PreparedStory, theme: ThemeChangeEvent) {

  const parameters = story.parameters as AddonParameters;
  

  if(!parameters.cckAddon) {
    throw new Error('cckAddon parameters are missing the required componentName.');
  }
  
  if(!parameters.cckAddon.componentName) {
    throw new Error('The cckAddon parameters do not specify a componentName.');
  }

  const uiBaseComponentName = parameters.cckAddon.componentName;
  const themeComponentConfig = theme.themeConfig.components?.[uiBaseComponentName];


  if(!themeComponentConfig) {
    throw new Error('The selected theme does not support this component');
  }

  return {parameters, uiBaseComponentName, themeComponentConfig};
}

export function getStoryComponentName(componentRef: unknown, storyId?: string): string {

  // Angular
  if(isClassRef(componentRef)) {
    const componentName = componentRef.name;

    if (!componentName) {
      throw new Error(`Component is not a class ref in the story parameters for story ID: ${storyId ?? componentRef}`);
    }

    return componentName;
  }

  // React
  const reactComponent = componentRef as React.ComponentType;
  if(!reactComponent.displayName) {
    throw new Error(`Component is not a react ref in the story parameters for story ID: ${storyId ?? componentRef}`);
  }

  return reactComponent.displayName;
}