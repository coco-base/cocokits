import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeDefaultHintError: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Default: Hint & Error',
  tags: ['theme:default', 'theme:frames-x'],
  parameters: {
    docs: {
      description: {
        story: `Displays the formField component in states with hints and error messages, illustrating how the component visually handles guidance and validation feedback to enhance user interaction.`,
      },
      source: {
        code: `TODO: Add source code of story`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      emailIcon,
      infoIcon,
      copyIcon,
    },
    template: `
          <table class="story-variant-table story-variant-table--center-header">
          <tbody>
            <!-- Hint -->
            <tr>
              <td>Hint</td>
              <td>
                <cck-form-field>
                  <cck-label>Label</cck-label>
                  <input cckInput/>
                  <cck-hint>This is a hint text</cck-hint>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Error -->
            <tr>
              <td>Error</td>  
              <td>
                 <cck-form-field>
                  <cck-label>Label</cck-label>
                  <input cckInput/>
                  <cck-error [force]="true">This is an error text</cck-error>
                </cck-form-field>
              </td>
            </tr>
          </tbody>
        </table>
    `,
  }),
};
