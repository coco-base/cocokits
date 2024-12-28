import { getInstance } from '@cocokits/common-utils';
import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, PreviewThemeEvent } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Size: AngularStoryObj<ButtonComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:button', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% cckThemeComponentConfig.size.values.map(size => { %>
            <button cck-button type='<%= type %>' size='<%= size %>'>Button - <%= size %></button>
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
      @for (size of themeComponentConfig?.size?.values; let col = $index; track size) {
        <button cck-button [type]="cckControl.type" [size]="size">Button - {{size}}</button>
      }
    `,
  }),
};
