import { ChipListComponent } from '@cocokits/angular-form-field';
import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<ChipListComponent> = {
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
            <cck-form-field
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            >
              <cck-label><%= label %></cck-label>
              <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" placeholder="<%= placeholder %>" [addOnBlur]="<%= addOnBlur %>">
              </cck-chip-list>
            </cck-form-field>
            `,
        },
      ],
      hasControl: true,
      controls: [
        {
          displayName: 'Label',
          default: 'Favorite Foods',
          storyArgKey: 'label',
          type: AddonParametersControlType.Text,
        },
        {
          displayName: 'Placeholder',
          default: 'Add a new food',
          storyArgKey: 'placeholder',
          type: AddonParametersControlType.Text,
        },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        {
          displayName: 'Add On Blur',
          default: false,
          storyArgKey: 'addOnBlur',
          type: AddonParametersControlType.Boolean,
        },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      chips: ['Steak', 'Pizza', 'Burger'],
    },
    template: `
      <cck-form-field style="width: 100%" [disabled]="cckControl.disabled" ${ngThemeArgsToTemplate(args)}>
        <cck-label>{{cckControl.label}}</cck-label>
        <cck-chip-list [chips]="chips" placeholder="{{cckControl.placeholder}}" [addOnBlur]="cckControl.addOnBlur">
        </cck-chip-list>
      </cck-form-field>
    `,
  }),
};
