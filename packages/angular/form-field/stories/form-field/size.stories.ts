import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';

export const Size: AngularStoryObj<FormFieldComponent> = {
  name: 'Size',
  tags: ['uiComponentName:formField', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-form-field [size]="...">
            <cck-label>Email</cck-label>
            <input cckInput placeholder="Write your Email"/>
          </cck-form-field>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `   
      <story-table
        [headers]="uiComponentConfig?.formField.size?.values"
        [rowHeaders]="uiComponentConfig?.formField.type?.values ?? []">
        @for (type of uiComponentConfig?.formField.type?.values ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.formField.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-form-field [size]="size" [type]="type">
                <cck-label>Email</cck-label>
                <input cckInput placeholder="Write your Email"/>
              </cck-form-field>
            </story-table-cell>
          }
        }
      </story-table>        
    `,
  }),
};
