import { Preview  } from "@storybook/react";

import { Icons } from "@cocokits/storybook-addon-theme";

import { withThemeConfigDecorator } from "./decorator";


export const PREVIEW_BASE: Preview = {
  tags: ['autodocs'],
  decorators: [
    withThemeConfigDecorator()
  ],
  argTypes: {
    cckControl: { control: 'object', table: { disable: true } },
    cckIcons: { control: 'object', table: { disable: true } },
  },
  args: {
    cckIcons: Icons,
  },
};
