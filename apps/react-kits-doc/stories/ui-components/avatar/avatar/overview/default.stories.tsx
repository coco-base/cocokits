import { Avatar } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Avatar> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
      ],
    },
  },
  args: {},
  render: (args) => (
    <Avatar {...reactThemeArgsToTemplate(args)}>
    </Avatar>
  ),
};
