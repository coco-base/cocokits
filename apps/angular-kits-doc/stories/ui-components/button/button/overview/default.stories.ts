import { ButtonComponent } from '@cocokits/angular-button';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<ButtonComponent> = {
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
          <button
            cck-button
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            <% if (disabled) { %> disabled <% } %>
          >
              <% if (leftIcon !== 'none') { %>
                <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
              <% } %>
              <%= text %>
              <% if (rightIcon !== 'none') { %>
                <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
              <% } %>
          </button>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.text('Button'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.leftIcon('heartFill'),
        CCK_CONTROL.rightIcon('none'),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <button
          cck-button
          ${ngThemeArgsToTemplate(args)}
          [disabled]="cckControl.disabled">
            @if(cckControl.leftIcon !== 'none') {
              <cck-svg-icon [icon]="cckIcons[cckControl.leftIcon]"></cck-svg-icon>
            }
            {{cckControl.text}}
            @if(cckControl.rightIcon !== 'none') {
              <cck-svg-icon [icon]="cckIcons[cckControl.rightIcon]"></cck-svg-icon>
            }
        </button>
      `,
    };
  },
};
