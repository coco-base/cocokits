import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const Indeterminate: AngularStoryObj<CheckboxComponent> = {
  name: 'Indeterminate',

  parameters: {
    docs: {
      description: {
        story:
          'Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to represent a checkbox with three states, e.g. a checkbox that represents a nested list of checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately set to false.',
      },
      source: {
        code: `
          <cck-checkbox [indeterminate]="ture">Label</cck-checkbox>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
        <story-checkbox-indeterminate></story-checkbox-indeterminate>
    `,
  }),
};
