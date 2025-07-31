import { BadgeComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<BadgeComponent> = {
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
          <cck-badge
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            <% if (max > 0) { %> [max]="<%= max %>" <% } %>
            <% if (content !== '') { %> [content]="'<%= content %>'" <% } %>
            <% if (hide) { %> [hide]="<%= hide %>" <% } %>
          >
          </cck-badge>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.customText('Content', '2'),
        CCK_CONTROL.customNumber('Max', 10),
        CCK_CONTROL.customBoolean('Hide', false),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-badge
          ${ngThemeArgsToTemplate(args)}
          [max]="cckControl.max"
          [content]="cckControl.content"
          [hide]="cckControl.hide"
        />
      `,
    };
  },
};
