import { getInstance } from '@cocokits/common-utils';
import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, PreviewThemeEvent } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Color: AngularStoryObj<ButtonComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:button', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% cckThemeComponentConfig.color.values.map(color => { %>
            <button cck-button type='<%= type %>' color='<%= color %>'><%= color %></button>
          <% }) %>
          `,
        },
      ],
      controls: [{ prop: 'type', type: AddonParametersControlType.SelectThemeConfig }],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getInstance(PreviewThemeEvent).getCurrentTheme().themeConfig.components.button,
    },
    template: `
      @for (color of themeComponentConfig?.color?.values; let col = $index; track color) {
        <button cck-button [type]="cckControl.type" [color]="color">{{color}}</button>
      }
    `,
  }),
};
