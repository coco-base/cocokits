import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<BadgeContainerComponent> = {
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
          <cck-badge-container
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            position="<%= position %>"
            <% if (offsetX && offsetX !== '' && offsetY && offsetY !== '') { %> [offset]="['<%= offsetX %>', '<%= offsetY %>']" <% } %>
            <% if (radius !== '') { %> radius="<%= radius %>" <% } %>
          >

            <!-- Replace the following \`div\` with your custom content -->
            <div
              [style.width]="'70px'"
              [style.height]="'70px'"
              [style.background-color]="'var(--cck-doc-color-bg-3, #191b23)'"
              [style.border]="'3px solid var(--cck-doc-color-border-3, #ffffff33)'"
              <% if (radius !== '') { %> [style.border-radius]="'<%= radius %>'" <% } %>
            ></div>

            <cck-badge
              <% if (typeof badgeType !== 'undefined') { %> type='<%= badgeType %>' <% } %>
              <% if (typeof badgeSize !== 'undefined') { %> size='<%= badgeSize %>' <% } %>
              <% if (typeof badgeColor !== 'undefined') { %> color='<%= badgeColor %>' <% } %>
              <% if (max > 0) { %> [max]="<%= max %>" <% } %>
              <% if (content !== '') { %> [content]="'<%= content %>'" <% } %>
              <% if (hide) { %> [hide]="<%= hide %>" <% } %>
            />
          </cck-badge-container>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.type('badge'),
        CCK_CONTROL.size('badge'),
        CCK_CONTROL.color('badge'),
        CCK_CONTROL.customSelect('position', ['top-left', 'top-right', 'bottom-left', 'bottom-right'], 'top-right'),
        CCK_CONTROL.customText('Content', '2'),
        CCK_CONTROL.customNumber('Max', 10),
        CCK_CONTROL.customText('Radius', '12px'),
        CCK_CONTROL.customText('OffsetX', undefined),
        CCK_CONTROL.customText('OffsetY', undefined),
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
        <cck-badge-container
          ${ngThemeArgsToTemplate(args)}
          [position]="cckControl.position"
          [offset]="[cckControl.offsetX, cckControl.offsetY]"
          [radius]="cckControl.radius"
        >
          <div
            [style.width]="'70px'"
            [style.height]="'70px'"
            [style.background-color]="'var(--cck-doc-color-bg-3)'"
            [style.border]="'3px solid var(--cck-doc-color-border-3)'"
            [style.border-radius]="cckControl.radius"
          ></div>
          <cck-badge
            [type]="cckControl.badgeType"
            [size]="cckControl.badgeSize"
            [color]="cckControl.badgeColor"
            [content]="cckControl.content"
            [hide]="cckControl.hide"
            [max]="cckControl.max"
          />
        </cck-badge-container>
      `,
    };
  },
};
