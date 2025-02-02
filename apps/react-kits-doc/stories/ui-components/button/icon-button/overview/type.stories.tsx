import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof IconButton> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story: 'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { IconButton } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  <IconButton
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  >
                    <SvgIcon icon={YOUR_ICON} />
                  </IconButton>
                <% }) %>
              </>
            );
          }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      { args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <IconButton key={index} type={type}>
          <SvgIcon icon={args.cckIcons.heartFill} />
        </IconButton>
      )) }
    </>
  )
};
