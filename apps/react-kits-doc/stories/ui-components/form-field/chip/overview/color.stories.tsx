import { Chip } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Chip> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story:
          'The color is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          <>
            <% themeComponentConfig.color.values.map(color => { %>
              <Chip
                color="<%= color %>"
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              >
                Chip - <%= color %>
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
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <Chip key={index} type={args.cckControl.type} color={color}>
          Chip - {color}
        </Chip>
      ))}
    </>
  )
};
