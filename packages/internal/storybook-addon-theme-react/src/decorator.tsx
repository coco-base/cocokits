import { Args } from '@storybook/types';

import { getInstance } from "@cocokits/common-utils";
import { ThemeConfigContext } from "@cocokits/react-core";
import { ThemeEvent } from "@cocokits/storybook-addon-theme";


export function withThemeConfigDecorator() {
  return (Story: any) => {
    const theme = getInstance(ThemeEvent).getCurrentTheme();
    return (
      <ThemeConfigContext.Provider value={theme.themeConfig}>
        <Story />
      </ThemeConfigContext.Provider>
    );
  };
} 

export function reactThemeArgsToTemplate(storyArgs: {cckControl: Args}): Args {
  if(!storyArgs.cckControl) {
    return {};
  }

  return {
    type: storyArgs.cckControl.type,
    size: storyArgs.cckControl.size,
    color: storyArgs.cckControl.color,
  };
}