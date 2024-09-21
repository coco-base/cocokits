import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeDefaultTrailing: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Default: Trailing',
  tags: ['theme:default'],
  parameters: {
    docs: {
      description: {
        story: `Displays the formField component with a trailing element, illustrating the inclusion of icons or actions at the end to improve usability and interface design.`,
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
            <tr>
              <td>ChipList</td>
              <td>
                <cck-form-field class="story-w-500">
                  <cck-label>ChipList</cck-label>
                  <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" [placeholder]="'Add a new food'" [addOnBlur]="true"/>
                  <cck-trailing [type]="'regular'">.com</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            <!-- Regular -->
            <tr>
              <td>Regular</td>
              <td>
                <cck-form-field>
                  <cck-label>Url</cck-label>
                  <input cckInput placeholder="google"/>
                  <cck-trailing [type]="'regular'">.com</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Medium -->
            <tr>
              <td>Medium</td>  
              <td>
                 <cck-form-field>
                  <cck-label>Url</cck-label>
                  <input cckInput placeholder="google"/>
                  <cck-trailing [type]="'medium'">.com</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Grey -->
            <tr>
              <td>Grey Color</td>
              <td>
                <cck-form-field>
                  <cck-label>Url</cck-label>
                  <input cckInput placeholder="google"/>
                  <cck-trailing [color]="'grey'">.com</cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            
           <!-- Clickable -->
            <tr>
              <td>Clickable</td>
              <td>
                <cck-form-field>
                  <cck-label>Url</cck-label>
                  <input cckInput placeholder="google.com"/>
                  <cck-trailing [clickable]="true">
                    <cck-svg-icon [icon]="copyIcon"/>
                    <span>Copy</span>
                  </cck-trailing>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Disabled -->
            <tr>
              <td>Disabled</td>
              <td>
                <cck-form-field [disabled]="true">
                  <cck-label>Url</cck-label>
                  <input cckInput placeholder="google.com"/>
                  <cck-trailing [clickable]="true">
                    <cck-svg-icon [icon]="copyIcon"/>
                    <span>Copy</span>
                  </cck-trailing>
                </cck-form-field>
              </td>
            </tr>
          </tbody>
        </table>
    `,
  }),
};
