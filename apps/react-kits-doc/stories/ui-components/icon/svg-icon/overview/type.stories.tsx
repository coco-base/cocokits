import { SvgIcon } from '@cocokits/react-icon';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof SvgIcon> = {
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
          import { Button } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  <SvgIcon
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    icon={YOUR_ICON}
                  />
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
        <SvgIcon key={index} type={type} icon={args.cckIcons.heartFill}/>
      )) }
    </>
  )
};
