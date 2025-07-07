import { Tab, Tabs } from '@cocokits/react-tabs';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Tabs> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique Tabs styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Tabs, Tab } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>

                  {/* ------------ <%= type %> ------------ */}
                  <Tabs
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    hideContent={true}
                  >
                    <Tab header="Header 1"/>
                    <Tab header="Header 2"/>
                    <Tab header="Header 3"/>
                  </Tabs>
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
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <Tabs key={index} type={type} hideContent={true}>
          <Tab header="Header 1" />
          <Tab header="Header 2" />
          <Tab header="Header 3" />
        </Tabs>
      ))}
    </>
  ),
};
