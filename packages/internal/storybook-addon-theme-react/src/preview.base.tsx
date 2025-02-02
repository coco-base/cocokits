import { Preview  } from "@storybook/react";

import { Icons } from "@cocokits/common-icons";

import { withThemeConfigDecorator, withWrapperDecorator } from "./decorator";


export const PREVIEW_BASE: Preview = {
  tags: ['autodocs'],
  decorators: [
    withWrapperDecorator(),
    withThemeConfigDecorator()
  ],
  argTypes: {
    cckControl: { control: 'object', table: { disable: true } },
    cckExampleArgs: { control: 'object', table: { disable: true } },
    cckExampleCssVariables: { control: 'text', table: { disable: true } },
    cckIcons: { control: 'object', table: { disable: true } },
  },
  args: {
    cckIcons: Icons,
  },
};
