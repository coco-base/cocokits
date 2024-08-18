import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeDefaultPrefixSuffix: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Default: Prefix & Suffix',
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
            <!-- Prefix -->
            <tr>
              <td>Prefix</td>
              <td>
                <cck-form-field>
                  <cck-label>Email</cck-label>
                  <cck-prefix>
                    <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>  
                  </cck-prefix>
                  <input cckInput placeholder="Write your Email"/>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Suffix -->
            <tr>
              <td>Suffix</td>  
              <td>
                <cck-form-field>
                  <cck-label>Email</cck-label>
                  <input cckInput placeholder="Write your Email"/>
                  <cck-suffix>
                    <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>  
                  </cck-suffix>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Both -->
            <tr>
              <td>Both</td>
              <td>
                <cck-form-field>
                  <cck-label>Email</cck-label>
                  <cck-prefix>
                    <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>  
                  </cck-prefix>
                  <input cckInput placeholder="Write your Email"/>
                  <cck-suffix>
                    <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>  
                  </cck-suffix>
                </cck-form-field>
              </td>
            </tr>
            
            <!-- Disabled -->
            <tr>
              <td>Disabled</td>
              <td>
                <cck-form-field [disabled]="true">
                  <cck-label>Email</cck-label>
                  <cck-prefix>
                    <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>  
                  </cck-prefix>
                  <input cckInput placeholder="Write your Email"/>
                  <cck-suffix>
                    <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>  
                  </cck-suffix>
                </cck-form-field>
              </td>
            </tr>
          </tbody>
        </table>
    `,
  }),
};
