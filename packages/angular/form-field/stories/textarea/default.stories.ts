import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export const Default: AngularStoryObj<TextareaComponent> = {
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
          <cck-label>Label</cck-label>
          <textarea cckTextarea></textarea>
        </cck-form-field>
    `,
  }),
};
