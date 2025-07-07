import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Tabs> = {
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
          import { Tabs, Tab } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.color.values.map(color => { %>

                  {/* ------------ <%= color %> ------------ */}
                  <Tabs
                    <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                    type=<%= type %>
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <Tabs key={index} color={color} type={args.cckControl.type} hideContent={true}>
          <Tab header="Header 1" />
          <Tab header="Header 2" />
          <Tab header="Header 3" />
        </Tabs>
      ))}
    </>
  ),
};
