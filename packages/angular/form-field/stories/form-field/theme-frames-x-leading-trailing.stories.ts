import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeFramesXLeadingTrailing: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme FramesX: Leading & Trailing',
  tags: ['theme:frames-x'],
  parameters: {
    docs: {
      description: {
        story: `Shows the formField component with a leading and trailing element, demonstrating how labels can be integrated at the start to enhance functionality and user interaction.`,
      },
      source: {
        code: `
          <cck-form-field>
            <cck-leading>Box</cck-leading>
            <input cckInput placeholder="Text"/>
            <cck-trailing>Box</cck-trailing>
          </cck-form-field>
        `,
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
      <story-table
        [rowHeaders]="['Leading', 'Trailing', 'Both', 'Disabled']"
        cellHAlign="left">
        
        <!-- Leading -->
        <story-table-cell row="0">
          <cck-form-field>
            <cck-leading>Box</cck-leading>
            <input cckInput placeholder="Text"/>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Trailing -->
        <story-table-cell row="1">
          <cck-form-field>
            <input cckInput placeholder="Text"/>
            <cck-trailing>Box</cck-trailing>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Both -->
        <story-table-cell row="2">
          <cck-form-field>
            <cck-leading>Box</cck-leading>
            <input cckInput placeholder="Text"/>
            <cck-trailing>Box</cck-trailing>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Disabled -->
        <story-table-cell row="3">
          <cck-form-field [disabled]="true">
            <cck-leading>Box</cck-leading>
            <input cckInput placeholder="Text"/>
            <cck-trailing>Box</cck-trailing>
          </cck-form-field>
        </story-table-cell>
       
      </story-table>
`,
  }),
};
