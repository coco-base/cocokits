import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeCocokitsHintError: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Cocokits: Hint & Error',
  tags: ['theme:cocokits', 'theme:frames-x'],
  parameters: {
    docs: {
      description: {
        story: `Displays the formField component in states with hints and error messages, illustrating how the component visually handles guidance and validation feedback to enhance user interaction.`,
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
      emailIcon,
      infoIcon,
      copyIcon,
    },
    template: `
      <story-table [headers]="['Hint', 'Error']">
        
        <!-- Hint -->
        <story-table-cell row="0" col="0">
          <cck-form-field>
            <cck-label>Label</cck-label>
            <input cckInput/>
            <cck-hint>This is a hint text</cck-hint>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Error -->
        <story-table-cell row="0" col="1">
          <cck-form-field>
            <cck-label>Label</cck-label>
            <input cckInput/>
            <cck-error [force]="true">This is an error text</cck-error>
          </cck-form-field>
        </story-table-cell>
        
      </story-table>
    `,
  }),
};
