import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeDefaultHintError: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Default: Hint & Error',
  tags: ['theme:default'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
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
                  <cck-error [force]="true" (click)="showError1 = false">This is an error text</cck-error>
                </cck-form-field>
              </td>
            </tr>
          </tbody>
        </table>
    `,
  }),
};
