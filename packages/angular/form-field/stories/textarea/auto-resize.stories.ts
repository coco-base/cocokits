import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { TextareaComponent } from '../../src/lib/textarea/textarea.component';
import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';

export const AutoResize: AngularStoryObj<TextareaComponent> = {
  name: 'AutoResize',
  parameters: {
    docs: {
      description: {
        story: `Automatically adjusts the height of the textarea as text is entered, ensuring optimal visibility and a seamless user input experience.`,
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
            <cck-form-field>
              <cck-label>AutoResize</cck-label>
              <textarea
                cckTextarea
                [autoResize]="true"
                placeholder="Placeholder"
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              >
              </textarea>
            </cck-form-field>
          `,
        },
      ],
      controls: [{ prop: 'type', type: AddonParametersControlType.SelectThemeConfig }],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field style="width: 100%">
        <cck-label>AutoResize</cck-label>
        <textarea
          cckTextarea
          [autoResize]="true"
          placeholder="Placeholder"
          [type]="cckControl.type"
        >
        </textarea>
      </cck-form-field>
    `,
  }),
};
