import { Divider, Menu, MenuItem } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Menu> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            <>
              <% themeComponentConfig.type.values.map(type => { %>

                {/* <%= color %> */}
                <Menu [type]="<%= type %>">
                  <MenuItem>Edit</MenuItem>
                  <MenuItem>Duplicate</MenuItem>
                  <Divider/>
                  <MenuItem>Archive</MenuItem>
                  <MenuItem>Move</MenuItem>
                </Menu>
              <% }) %>
              
            </>
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <Menu key={index} type={type} open={true}>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <Divider/>
          <MenuItem>Archive</MenuItem>
          <MenuItem>Move</MenuItem>
        </Menu>
      ))}
    </>
  )
};
