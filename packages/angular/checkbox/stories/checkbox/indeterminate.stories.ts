import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const Indeterminate: AngularStoryObj<CheckboxComponent> = {
  name: 'Indeterminate',

  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `
          TODO: ...
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
        <story-checkbox-indeterminate></story-checkbox-indeterminate>
    `,
  }),
};
