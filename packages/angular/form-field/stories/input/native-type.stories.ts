import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';

export const NativeType: AngularStoryObj<FormFieldComponent> = {
  name: 'NativeType',
  tags: ['uiComponentName:formField'],
  parameters: {
    docs: {
      description: {
        story: `Illustrates the component's support for various native HTML input types, highlighting how each type behaves and integrates within the user interface.`,
      },
      source: {
        code: `TODO:...`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      types: [
        'color',
        'date',
        'datetime-local',
        'email',
        'month',
        'number',
        'password',
        'search',
        'tel',
        'text',
        'time',
        'url',
        'week',
      ],
    },
    template: `      
      <table class="story-variant-table story-variant-table--center-header">
        
        <tbody>
            @for (type of types; track type) {
              <tr>
                <td>{{type | titlecase}}</td>

                <td>
                  <cck-form-field>
                    <input cckInput [type]="type"/>
                  </cck-form-field>
                </td>
            </tr>
          }
        </tbody>
      </table>
    `,
  }),
};
