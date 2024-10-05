import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeCocokitsLeading: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Cocokits: Leading',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story: `Shows the formField component with a leading element, demonstrating how icons or labels can be integrated at the start to enhance functionality and user interaction.`,
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
            <!-- Regular -->
            <tr>
              <td>Regular</td>
              <td>
                <cck-form-field>
                  <cck-label>Url</cck-label>
                  <cck-leading [type]="'regular'">https://</cck-leading>
                  <input cckInput placeholder="google.com"/>
                </cck-form-field>
              </td>
            </tr>
            
            <tr>
              <td></td>
              <td>
                <cck-form-field>
                  <cck-label>Phone</cck-label>
                  <cck-leading [type]="'medium'" [color]="'grey'">
                    <cck-select [size]="'sm'" [value]="'US'" style="width: 45px">
                      <cck-option [value]="'AT'">AT</cck-option>
                      <cck-option [value]="'IR'">IR</cck-option>
                      <cck-option [value]="'US'">US</cck-option>
                    </cck-select>
                  </cck-leading>
                  <input cckInput placeholder="+1 (555) 000-0000"/>
                  
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Medium -->
            <tr>
              <td>Medium</td>  
              <td>
                 <cck-form-field>
                  <cck-label>Url</cck-label>
                  <cck-leading [type]="'medium'">https://</cck-leading>
                  <input cckInput placeholder="google.com"/>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Grey -->
            <tr>
              <td>Grey Color</td>
              <td>
                <cck-form-field>
                  <cck-label>Url</cck-label>
                  <cck-leading [color]="'grey'">https://</cck-leading>
                  <input cckInput placeholder="google.com"/>
                </cck-form-field>
              </td>
            </tr>
            
           <!-- Clickable -->
            <tr>
              <td>Clickable</td>
              <td>
                <cck-form-field>
                  <cck-label>Url</cck-label>
                  <cck-leading [clickable]="true">https://</cck-leading>
                  <input cckInput placeholder="google.com"/>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Disabled -->
            <tr>
              <td>Disabled</td>
              <td>
                <cck-form-field [disabled]="true">
                  <cck-label>Url</cck-label>
                  <cck-leading>https://</cck-leading>
                  <input cckInput placeholder="google.com"/>
                </cck-form-field>
              </td>
            </tr>
          </tbody>
        </table>
    `,
  }),
};
