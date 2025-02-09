import { Chip } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Chip> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          <>
            <% themeComponentConfig.size.values.map(size => { %>
              <Chip
                size="<%= size %>"
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              >
                Chip - <%= size %>
              </Chip>
            <% }) %>
          </>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      { args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <Chip key={index} type={args.cckControl.type} size={size}>Chip - {size}</Chip>
      )) }
    </>
  )
};
