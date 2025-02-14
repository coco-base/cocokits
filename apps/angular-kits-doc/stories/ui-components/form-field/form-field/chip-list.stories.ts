import { FormFieldComponent } from '@cocokits/angular-form-field';
import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const ChipList: StoryObj<FormFieldComponent> = {
  name: 'ChipList',
  decorators: [
    // withWrapperDecorator({}, {width: '300px'}),
  ],
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

              <cck-chip-list
                [chips]="['Steak', 'Pizza', 'Burger']"
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
                <% if (addOnBlur) { %> [addOnBlur]="<%= addOnBlur %>" <% } %>
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
                <cck-hint [force]="true"><%= error %></cck-hint>
              <% } %>
            </cck-form-field>
          `,
        },
      ],
      hasControl: true,
      controls: [
        { displayName: 'Label', default: 'Label', storyArgKey: 'label', type: AddonParametersControlType.Text },
        {
          displayName: 'Placeholder',
          default: 'Placeholder',
          storyArgKey: 'placeholder',
          type: AddonParametersControlType.Text,
        },
        { displayName: 'Hint', default: '', storyArgKey: 'hint', type: AddonParametersControlType.Text },
        { displayName: 'Error', default: '', storyArgKey: 'error', type: AddonParametersControlType.Text },
        {
          displayName: 'Prefix Icon',
          default: 'none',
          icons: ['none', 'link', 'info', 'email'],
          storyArgKey: 'prefix',
          type: AddonParametersControlType.Icon,
        },
        {
          displayName: 'Suffix Icon',
          default: 'none',
          icons: ['none', 'link', 'info', 'email'],
          storyArgKey: 'suffix',
          type: AddonParametersControlType.Icon,
        },
        { displayName: 'Leading', default: '', storyArgKey: 'leading', type: AddonParametersControlType.Text },
        { displayName: 'Trailing', default: '', storyArgKey: 'trailing', type: AddonParametersControlType.Text },

        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        {
          displayName: 'Add On Blur',
          default: false,
          storyArgKey: 'addOnBlur',
          type: AddonParametersControlType.Boolean,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      chips: ['Steak', 'Pizza', 'Burger'],
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

        <cck-chip-list
          [chips]="chips"
          placeholder="{{cckControl.placeholder}}"
          [addOnBlur]="cckControl.addOnBlur"/>

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
