import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export const AutoResize: AngularStoryObj<TextareaComponent> = {
  name: 'AutoResize',
  parameters: {
    docs: {
      description: {
        story: `Automatically adjusts the height of the textarea as text is entered, ensuring optimal visibility and a seamless user input experience.`,
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
          <cck-label>AutoResize</cck-label>
          <textarea cckTextarea [autoResize]="true"></textarea>
        </cck-form-field>
    `,
  }),
};
