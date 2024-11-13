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
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `      
      <story-table
        [headers]="themeComponentConfig?.formField?.color?.values"
        [rowHeaders]="themeComponentConfig?.formField?.type?.values ?? []">
        @for (type of themeComponentConfig?.formField?.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.formField?.color?.values; let col = $index; track color) {
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
