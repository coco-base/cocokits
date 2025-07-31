import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Position: StoryObj<BadgeContainerComponent> = {
  name: 'Position',
  parameters: {
    docs: {
      description: {
        story:
          'The position of the badge can be adjusted to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
         <% ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(position => { %>

           <!-- <%= position %> -->
            <cck-badge-container
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
              position='<%= position %>'
            >
              <div
                [style.width]="'70px'"
                [style.height]="'70px'"
                [style.background-color]="'var(--cck-doc-color-bg-3, #191b23)'"
                [style.border]="'3px solid var(--cck-doc-color-border-3, #ffffff33)'"
                [style.border-radius]="'12px'"
              ></div>
              <cck-badge content="2" radius="12px"/>
            </cck-badge-container>
         <% }) %>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (position of ['top-left', 'top-right', 'bottom-left', 'bottom-right']; let col = $index; track position) {
        <cck-badge-container [type]="cckControl.type" [position]="position" radius="12px">
          <div
            [style.width]="'70px'"
            [style.height]="'70px'"
            [style.background-color]="'var(--cck-doc-color-bg-3, #191b23)'"
            [style.border]="'3px solid var(--cck-doc-color-border-3, #ffffff33)'"
            [style.border-radius]="'12px'"
          ></div>
          <cck-badge content="2"/>
        </cck-badge-container>
      }
    `,
  }),
};
