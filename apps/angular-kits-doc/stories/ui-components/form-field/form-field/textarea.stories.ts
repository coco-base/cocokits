import { FormFieldComponent } from '@cocokits/angular-form-field';
import { AddonParametersControlType, CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Textarea: StoryObj<FormFieldComponent> = {
  name: 'Textarea',
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
            <cck-form-field
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (disabled) { %> disabled <% } %>
            >
              <% if (label) { %>
                <cck-label><%= label %></cck-label>
              <% } %>
              <% if (leading) { %>
                <cck-leading><%= leading %></cck-leading>
              <% } %>
              <% if (prefix !== 'none') { %>
                <cck-prefix>
                  <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
                </cck-prefix>
              <% } %>
              
              <textarea
                cckTextarea
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
              />

              <% if (suffix !== 'none') { %>
                <cck-suffix>
                  <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
                </cck-suffix>
              <% } %>
              <% if (trailing) { %>
                <cck-trailing><%= trailing %></cck-trailing>
              <% } %>
              <% if (hint) { %>
                <cck-hint><%= hint %></cck-hint>
              <% } %>
              <% if (error) { %>
                <cck-hint><%= error %></cck-hint>
              <% } %>
            </cck-form-field>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label('Label'),
        CCK_CONTROL.placeholder('Placeholder'),
        CCK_CONTROL.hint(''),
        CCK_CONTROL.error(''),
        CCK_CONTROL.prefixIcon('none'),
        CCK_CONTROL.suffixIcon('none'),
        CCK_CONTROL.leading(''),
        CCK_CONTROL.trailing(''),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(false),
        { displayName: 'Max Rows', default: 5, storyArgKey: 'maxRows', type: AddonParametersControlType.Number },
        { displayName: 'Min Rows', default: 2, storyArgKey: 'minRows', type: AddonParametersControlType.Number },
        {
          displayName: 'Auto Resize',
          default: false,
          storyArgKey: 'autoResize',
          type: AddonParametersControlType.Boolean,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field
        style="width: 100%;"
        [disabled]="cckControl.disabled"
        ${ngThemeArgsToTemplate(args)}>

        @if(cckControl.label) {
          <cck-label>{{cckControl.label}}</cck-label>
        }

        @if(cckControl.leading) {
          <cck-leading>{{cckControl.leading}}</cck-leading>
        }

        @if(cckControl.prefix !== 'none') {
          <cck-prefix>
            <cck-svg-icon [icon]="cckIcons[cckControl.prefix]"></cck-svg-icon>
          </cck-prefix>
        }

        <textarea
          cckTextarea
          placeholder="{{cckControl.placeholder}}"
          [autoResize]="cckControl.autoResize"
          [minRows]="cckControl.minRows"
          [maxRows]="cckControl.maxRows"
          [required]="cckControl.required">
        </textarea>

        @if(cckControl.suffix !== 'none') {
          <cck-suffix>
            <cck-svg-icon [icon]="cckIcons[cckControl.suffix]"></cck-svg-icon>
          </cck-suffix>
        }

        @if(cckControl.trailing) {
          <cck-trailing>{{cckControl.trailing}}</cck-trailing>
        }

        @if(cckControl.hint) {
          <cck-hint>{{cckControl.hint}}</cck-hint>
        }
        @if(cckControl.error) {
          <cck-error [force]="true">{{cckControl.error}}</cck-error>
        }
      </cck-form-field>
    `,
  }),
};
