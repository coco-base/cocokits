import { Divider, Menu, MenuItem } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Menu> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
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

              {/* <%= color %> */}
              <Menu
                color="<%= color %>"
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              >
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <Menu key={index} type={args.cckControl.type} color={color} open={true} _skipOverlay={true}>
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

