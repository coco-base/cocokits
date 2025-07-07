import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Disabled: StoryObj<typeof Tabs> = {
  name: 'Disabled',
  parameters: {
    docs: {
      description: {
        story:
          'Disabled tabs prevent user interaction, ensuring that users cannot select or activate them, which is useful for indicating unavailable options.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Tabs, Tab } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <Tabs
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                hideContent={true}
              >
                <Tab header="Header 1"/>
                <Tab header="Header 2"/>
                <Tab header="Header 3"/>
              </Tabs>
            );
          }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      <Tabs type={args.cckControl.type} hideContent={true}>
        <Tab header="Header 1" />
        <Tab header="Header 2" disabled/>
        <Tab header="Header 3" />
      </Tabs>
    </>
  ),
};
