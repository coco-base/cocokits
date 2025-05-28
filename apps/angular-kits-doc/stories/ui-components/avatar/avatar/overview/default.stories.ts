import { AvatarComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<AvatarComponent> = {
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
          filename: 'example.component.ts',
          language: 'angular-ts',
          code: `
            import { Component } from "@angular/core";
            import { AvatarComponent } from '@cocokits/angular-components';

            @Component({
              selector: 'example-component',
              imports: [AvatarComponent],
              template: \`
                <cck-avatar
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                  <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                  <% if (src) { %> src="<%= src %>" <% } %>
                  <% if (!src && label) { %> label="<%= label %>" <% } %>
                  <% if (src && placeholderSrc) { %> [placeholderSrc]="placeholder" <% } %>
                  <% if (src && fallbackSrc) { %> [fallbackSrc]="fallback" <% } %>
                  <% if (alt) { %> alt="<%= alt %>" <% } %>
                  <% if (clickable) { %> [clickable]="<%= clickable %>" <% } %>
                />
              \`,
            })
            export class ExampleComponent {
              <% if (placeholderSrc) { %> protected placeholder="<%= placeholderSrc %>"; <% } %>
              <% if (fallbackSrc) { %> protected fallback="<%= fallbackSrc %>"; <% } %>
            }
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.label(''),
        CCK_CONTROL.alt('Image alt'),
        CCK_CONTROL.srcUrl(),
        CCK_CONTROL.placeholderSrc(),
        CCK_CONTROL.fallbackSrc(),
        CCK_CONTROL.clickable(),
        CCK_CONTROL.additional(),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-avatar
          ${ngThemeArgsToTemplate(args)}
          [src]="cckControl.src"
          [alt]="cckControl.alt"
          [label]="cckControl.label"
          [placeholderSrc]="cckControl.placeholderSrc"
          [fallbackSrc]="cckControl.fallbackSrc"
          [clickable]="cckControl.clickable"
        />
      `,
    };
  },
};
