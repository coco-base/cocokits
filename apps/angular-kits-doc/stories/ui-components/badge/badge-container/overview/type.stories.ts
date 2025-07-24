import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<BadgeContainerComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique Badge styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.type.values.map(type => { %>
            <cck-badge-container
              type='<%= type %>'
            >
              <div
                [style.width]="'70px'"
                [style.height]="'70px'"
                [style.background-color]="'var(--cck-doc-color-bg-3)'"
                [style.border]="'3px solid var(--cck-doc-color-border-3)'"
                [style.border-radius]="cckControl.radius"
              ></div>
              <cck-badge content="2"/>
            </cck-badge-container>
          <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (type of cckControl.themeComponentConfig?.type?.values; let col = $index; track type) {
        <cck-badge-container [type]="type">
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
