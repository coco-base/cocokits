import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src/lib/form-field/form-field.component';

export const Default: AngularStoryObj<FormFieldComponent> = {
  name: 'Default',
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
    },
    template: `
        <cck-form-field>
          <cck-label>Input</cck-label>
          <input cckInput placeholder="Placeholder"/>
        </cck-form-field>
        <cck-form-field>
          <cck-label>Textarea</cck-label>
          <textarea cckTextarea placeholder="Placeholder"></textarea>
        </cck-form-field>
        <cck-form-field class="story-w-200">
          <cck-label>Select</cck-label>
          <cck-select [placeholder]="'Select you food'">
            <cck-option [value]="'Steak'">Steak</cck-option>
            <cck-option [value]="'Pizza'">Pizza</cck-option>
            <cck-option [value]="'Burger'">Burger</cck-option>
          </cck-select>
        </cck-form-field>
    `,
  }),
};
