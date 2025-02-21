import { Divider, Menu, MenuItem } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Menu> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: 'Size options enable seamless integration with various themes or to highlight specific actions.',
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
                     import { Menu, MenuItem , Divider } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
            <>

              <% themeComponentConfig.size.values.map(size => { %>

                {/* <%= size %> */}
                <Menu
                  size="<%= size %>"
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
              );
            }

          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <Menu key={index} type={args.cckControl.type} size={size} open={true} _skipOverlay={true}>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <Divider />
          <MenuItem>Archive</MenuItem>
          <MenuItem>Move</MenuItem>
        </Menu>
      ))}
    </>
  ),
};
