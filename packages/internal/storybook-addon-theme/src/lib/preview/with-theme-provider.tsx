import { DocsContainer } from "@storybook/addon-docs";
import { DocsContextProps } from "@storybook/types";
import { ReactNode } from "react";

import { getInstance } from "@cocokits/common-utils";
import { ThemeConfigContext } from "@cocokits/react-core";

import { storybookAddonThemeConfig } from "../../theme/theme-config";
import { ColorModeEvent } from "../data-access/colo-mode-event/preview-color-mode-event";
import { ThemeEvent } from "../data-access/theme-event/preview-theme-event";
import { StoryControlStore } from "../features/story-control/preview-story-args.store";

interface DocPageContainerProps {
  context: DocsContextProps;
  children: ReactNode;
}

export const WithThemeProvider = (props: DocPageContainerProps) => {

  getInstance(ColorModeEvent);
  getInstance(ThemeEvent);
  getInstance(StoryControlStore);

  return (
    <ThemeConfigContext.Provider value={storybookAddonThemeConfig}>
      <DocsContainer context={props.context}>{props.children}</DocsContainer>
    </ThemeConfigContext.Provider>
  );
};