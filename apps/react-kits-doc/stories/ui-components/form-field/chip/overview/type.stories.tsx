import { Chip } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Chip> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('type')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            <% themeComponentConfig.type.values.map(type => { %>
              <Chip type="<%= type %>">
                Chip - <%= type %>
              </Chip>
            <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      { args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <Chip key={index} type={type}>Chip - {type}</Chip>
      )) }
    </>
  )
};
