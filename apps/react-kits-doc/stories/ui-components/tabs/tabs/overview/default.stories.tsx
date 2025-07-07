import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Tabs> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Tabs, Tab } from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <Tabs
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                headerAlign='<%= align %>'
                <% if (instantAnimation) { %> instantAnimation={<%= instantAnimation %>} <% } %>
                <% if (hideContent) { %> hideContent={<%= hideContent %>} <% } %>
              >
                <% for (let i = 0; i < length; i++) { %>
                  <Tab header="Header <%= i + 1 %>" <% if (i === 2) { %> disabled <% } %>>
                    <h3>Header <%= i + 1 %></h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </Tab>
                <% } %>
              </Tabs>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.customNumber('Length', 4),
        CCK_CONTROL.customSelect('Align', ['left', 'center', 'right', 'stretch']),
        CCK_CONTROL.customBoolean('Instant Animation'),
        CCK_CONTROL.customBoolean('Hide Content'),
      ],
    },
  },
  args: {},
  render: (args) => (
    <Tabs
      style={{width: '100%'}}
      {...reactThemeArgsToTemplate(args)}
      headerAlign={args.cckControl.align}
      instantAnimation={args.cckControl.instantAnimation}
      hideContent={args.cckControl.hideContent}>
      {new Array(args.cckControl.length).fill(1).map((_, index) => (
        <Tab header={'Header ' + (index + 1)} key={index} disabled={index === 2}>
          <h3>Header {index + 1}</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Tab>
      ))}
    </Tabs>
  ),
};
