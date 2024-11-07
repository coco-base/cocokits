import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';

export const Color: AngularStoryObj<FormFieldComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:formField', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <cck-form-field [color]="...">
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
      themeConfig: getSelectedCckTheme()?.themeConfig,
    },
    template: `      
      <story-table
        [headers]="themeConfig?.formField.color?.values"
        [rowHeaders]="themeConfig?.formField.type?.values ?? []">
        @for (type of themeConfig?.formField.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeConfig?.formField.color?.values; let col = $index; track color) {
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
