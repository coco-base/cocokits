import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';

export const Color: AngularStoryObj<FormFieldComponent> = {
  name: 'Color',
  tags: ['uiComponentName:formField', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `TODO: ...`,
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
        [headers]="uiComponentConfig?.formField.color?.values"
        [rowHeaders]="uiComponentConfig?.formField.type?.values ?? []">
        @for (type of uiComponentConfig?.formField.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.formField.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-form-field [color]="color">
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
