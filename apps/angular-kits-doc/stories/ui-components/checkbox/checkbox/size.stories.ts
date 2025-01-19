import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<CheckboxComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('size')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.size.values.map(size => { %>
              <cck-checkbox
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                size="<%= size %>"
              >
                Checkbox Label
              </cck-checkbox>
            <% }) %>
          `,
        },
      ],
      controls: [{ prop: 'type', type: AddonParametersControlType.SelectThemeConfig }],
    },
  },
  render: (args: any) => ({
    props: {
      ...args,
    },
    template: ` 
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-checkbox [size]="size" [type]="cckControl.type" [checked]="true">Checkbox Label</cck-checkbox>
      }
    `,
  }),
};
