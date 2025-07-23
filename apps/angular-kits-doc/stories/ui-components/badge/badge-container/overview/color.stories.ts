import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<BadgeContainerComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-badge-container
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color='<%= color %>'
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-badge-container [type]="cckControl.type" [color]="color">
          <div
            [style.width]="'70px'"
            [style.height]="'70px'"
            [style.background-color]="'var(--cck-doc-color-bg-3)'"
            [style.border]="'3px solid var(--cck-doc-color-border-3)'"
            [style.border-radius]="cckControl.radius"
          ></div>
          <cck-badge content="2"/>
        </cck-badge-container>
      }
    `,
  }),
};
