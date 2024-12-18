import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export const Default: AngularStoryObj<TextareaComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <cck-form-field>
            <cck-label>Label</cck-label>
            <textarea cckTextarea placeholder="Placeholder"></textarea>
          </cck-form-field>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
        <cck-form-field>
          <cck-label>Label</cck-label>
          <textarea cckTextarea placeholder="Placeholder"></textarea>
        </cck-form-field>
    `,
  }),
};
