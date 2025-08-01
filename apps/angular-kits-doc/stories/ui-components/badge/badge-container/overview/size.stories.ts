import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<BadgeContainerComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
         <% themeComponentConfig.size.values.map(size => { %>
            <cck-badge-container
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
              size='<%= size %>'
            >
              <div
                [style.width]="'70px'"
                [style.height]="'70px'"
                [style.background-color]="'var(--cck-doc-color-bg-3, #191b23)'"
                [style.border]="'3px solid var(--cck-doc-color-border-3, #ffffff33)'"
                [style.border-radius]="cckControl.radius"
              ></div>
              <cck-badge content="2"/>
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
      @for (size of cckControl.themeComponentConfig?.size?.values; let col = $index; track size) {
        <cck-badge-container [type]="cckControl.type" [size]="size">
          <div
            [style.width]="'70px'"
            [style.height]="'70px'"
            [style.background-color]="'var(--cck-doc-color-bg-3, #191b23)'"
            [style.border]="'3px solid var(--cck-doc-color-border-3, #ffffff33)'"
            [style.border-radius]="cckControl.radius"
          ></div>
          <cck-badge content="2"/>
        </cck-badge-container>
      }
    `,
  }),
};
