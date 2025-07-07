import { TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<TabsComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-tabs
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            headerAlign='<%= align %>'
            <% if (instantAnimation) { %> [instantAnimation]="<%= instantAnimation %>" <% } %>
            <% if (hideContent) { %> [hideContent]="<%= hideContent %>" <% } %>
          >
            <% for (let i = 0; i < length; i++) { %>
              <cck-tab header="Header <%= i + 1 %>" <% if (i === 2) { %> disabled <% } %>>
                <h3>Header <%= i + 1 %></h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </cck-tab>
            <% } %>
          </cck-tabs>
          `,
        },
      ],
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
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-tabs
          ${ngThemeArgsToTemplate(args)}
          [headerAlign]="cckControl.align"
          [hideContent]="cckControl.hideContent"
          [instantAnimation]="cckControl.instantAnimation"
        >
            <cck-tab
              *ngFor="let i of [].constructor(cckControl.length); let index = index"
              [header]="'Header ' + (index + 1)"
              [disabled]="index === 2"
            >
              <h3>Header {{ index + 1 }}</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </cck-tab>
        </cck-tabs>
      `,
    };
  },
};
