import { TextareaComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<TextareaComponent> = {
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
            <cck-form-field>
              <% if (label) { %>
                <cck-label><%= label %></cck-label>
              <% } %>
              
              <textarea
                cckTextarea
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled <% } %>
                <% if (required) { %> required <% } %>
                [autoResize]="<%= autoResize %>"
                [minRows]="<%= minRows %>"
                [maxRows]="<%= maxRows %>"
              />
            </cck-form-field>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label('Label'),
        CCK_CONTROL.placeholder('Placeholder'),
        CCK_CONTROL.minRows(),
        CCK_CONTROL.maxRows(),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(false),
        CCK_CONTROL.autoResize(),
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field style="width: 100%;">

        @if(cckControl.label) {
          <cck-label>{{cckControl.label}}</cck-label>
        }
        <textarea
          cckTextarea
          placeholder="{{cckControl.placeholder}}"
          [autoResize]="cckControl.autoResize"
          [minRows]="cckControl.minRows"
          [maxRows]="cckControl.maxRows"
          [required]="cckControl.required"
          [disabled]="cckControl.disabled"
          ${ngThemeArgsToTemplate(args)}
          >
        </textarea>
      </cck-form-field>
    `,
  }),
};
