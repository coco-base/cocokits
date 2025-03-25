import { ChipListComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
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
        CCK_CONTROL.label('Favorite Foods'),
        CCK_CONTROL.placeholder('Add a new food'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(false),
        CCK_CONTROL.addOnBlur(false),
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
