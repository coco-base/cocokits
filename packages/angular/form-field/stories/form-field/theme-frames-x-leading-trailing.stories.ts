import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeFramesXLeadingTrailing: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme FramesX: Leading & Trailing',
  tags: ['theme:frames-x'],
  parameters: {
    docs: {
      description: {
        story: `Shows the formField component with a leading and trailing element, demonstrating how labels can be integrated at the start to enhance functionality and user interaction.`,
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
            <!-- Leading -->
            <tr>
              <td>Leading</td>
              <td>
                <cck-form-field>
                  <cck-leading>Box</cck-leading>
                  <input cckInput placeholder="Text"/>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Trailing -->
            <tr>
              <td>Trailing</td>  
              <td>
                 <cck-form-field>
                  <input cckInput placeholder="Text"/>
                  <cck-trailing>Box</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Both -->
            <tr>
              <td>Both</td>
              <td>
                <cck-form-field>
                  <cck-leading>Box</cck-leading>
                  <input cckInput placeholder="Text"/>
                  <cck-trailing>Box</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Disabled -->
            <tr>
              <td>Disabled</td>
              <td>
                <cck-form-field [disabled]="true">
                  <cck-leading>Box</cck-leading>
                  <input cckInput placeholder="Text"/>
                  <cck-trailing>Box</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
          </tbody>
        </table>
    `,
  }),
};
