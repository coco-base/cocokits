import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Tabs> = {
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
          import { Tabs, Tab } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.size.values.map(size => { %>

                  {/* ------------ <%= size %> ------------ */}
                  <Tabs
                    <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                    type="<%= type %>"
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
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <Tabs key={index} size={size} type={args.cckControl.type} hideContent={true}>
          <Tab header="Header 1" />
          <Tab header="Header 2" />
          <Tab header="Header 3" />
        </Tabs>
      ))}
    </>
  ),
};
