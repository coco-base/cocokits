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
    `,
  }),
};
