import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { SelectComponent } from '../../src/lib/select/select.component';

export const CustomPreview: AngularStoryObj<SelectComponent> = {
  name: 'CustomPreview',
  parameters: {
    docs: {
      description: {
        story: `Displays the select component with a customized view for the selected item, enabling more complex and visually rich representations instead of just plain text.`,
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-form-field>
              <cck-label>Favorite food</cck-label>
              <cck-select [(ngModel)]="modelValue" [multiple]="true" placeholder="Favorite food">
                <cck-select-preview>
                  {{modelValue[0]}}
                  @if(modelValue.length > 1) {
                    <span style="opacity: 0.5">(+{{modelValue.length - 1}} more)</span>
                  }
                </cck-select-preview>
                <cck-option value="Steak">Steak</cck-option>
                <cck-option value="Pizza">Pizza</cck-option>
                <cck-option value="Burger">Burger</cck-option>
              </cck-select>
            </cck-form-field>
          `,
        },
      ],
      controls: [{ prop: 'type', type: AddonParametersControlType.SelectThemeConfig }],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      modelValue: [],
    },
    template: `
      <cck-form-field style="width: 100%">
        <cck-label>Favorite food</cck-label>
        <cck-select [(ngModel)]="modelValue" [multiple]="true" placeholder="Favorite food">
          <cck-select-preview>
            {{modelValue[0]}}
            @if(modelValue.length > 1) {
              <span style="opacity: 0.5">(+{{modelValue.length - 1}} more)</span>
            }
          </cck-select-preview>
          <cck-option value="Steak">Steak</cck-option>
          <cck-option value="Pizza">Pizza</cck-option>
          <cck-option value="Burger">Burger</cck-option>
        </cck-select>
      </cck-form-field>
    `,
  }),
};
