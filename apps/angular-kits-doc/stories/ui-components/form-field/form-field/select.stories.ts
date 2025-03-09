import { FormFieldComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

export const Select: StoryObj<FormFieldComponent> = {
  name: 'Select',
  decorators: [withWrapperDecorator({}, { width: '250px' })],
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
              <% if (prefixIcon !== 'none') { %>
                <cck-prefix>
                  <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
                </cck-prefix>
              <% } %>
              
              <cck-select
                 <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
                 <% if (multiple) { %> [multiple]="<%= multiple %>" <% } %>
                 <% if (maxOptionsHeight) { %> [maxOptionsHeight]="<%= maxOptionsHeight %>" <% } %>
                 <% if (required) { %> [required]="<%= required %>" <% } %>
              >
                <cck-option value="Steak">Steak</cck-option>
                <cck-option value="Pizza">Pizza</cck-option>
                <cck-option value="Burger">Burger</cck-option>
              </cck-select>

              <% if (suffixIcon !== 'none') { %>
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
                <cck-hint [force]="true"><%= error %></cck-hint>
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
        CCK_CONTROL.multiple(false),
        CCK_CONTROL.maxOptionsHeight(),
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

        @if(cckControl.prefixIcon !== 'none') {
          <cck-prefix>
            <cck-svg-icon [icon]="cckIcons[cckControl.prefixIcon]"></cck-svg-icon>
          </cck-prefix>
        }

        <cck-select
          placeholder="{{cckControl.placeholder}}"
          [multiple]="cckControl.multiple"
          [maxOptionsHeight]="cckControl.maxOptionsHeight"
          [required]="cckControl.required"
        >
          <cck-option value="Steak">Steak</cck-option>
          <cck-option value="Pizza">Pizza</cck-option>
          <cck-option value="Burger">Burger</cck-option>
        </cck-select>

        @if(cckControl.suffixIcon !== 'none') {
          <cck-suffix>
            <cck-svg-icon [icon]="cckIcons[cckControl.suffixIcon]"></cck-svg-icon>
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
