import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';
import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

export const ThemeCocokitsTrailing: AngularStoryObj<FormFieldComponent> = {
  name: 'Theme Cocokits: Trailing',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story: `Displays the formField component with a trailing element, illustrating the inclusion of icons or actions at the end to improve usability and interface design.`,
      },
      source: {
        code: `
          <cck-form-field>
            <cck-label>Url</cck-label>
            <input cckInput placeholder="google"/>
            <cck-trailing>.com</cck-trailing>
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
        [rowHeaders]="['Regular', 'Medium', 'Grey', 'Clickable', 'Disabled']"
        cellHAlign="start">
        
        <!-- Regular -->
        <story-table-cell row="0">
          <cck-form-field>
            <cck-label>Url</cck-label>
            <input cckInput placeholder="google"/>
            <cck-trailing [type]="'regular'">.com</cck-trailing>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Medium -->
        <story-table-cell row="1">
          <cck-form-field>
            <cck-label>Url</cck-label>
            <input cckInput placeholder="google"/>
            <cck-trailing [type]="'medium'">.com</cck-trailing>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Grey -->
        <story-table-cell row="2">
          <cck-form-field>
            <cck-label>Url</cck-label>
            <input cckInput placeholder="google"/>
            <cck-trailing [color]="'grey'">.com</cck-trailing>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Clickable -->
        <story-table-cell row="3">
          <cck-form-field>
            <cck-label>Url</cck-label>
            <input cckInput placeholder="google.com"/>
            <cck-trailing [clickable]="true">
              <cck-svg-icon [icon]="copyIcon"/>
              <span>Copy</span>
            </cck-trailing>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Disabled -->
        <story-table-cell row="4">
          <cck-form-field [disabled]="true">
            <cck-label>Url</cck-label>
            <input cckInput placeholder="google.com"/>
            <cck-trailing [clickable]="true">
              <cck-svg-icon [icon]="copyIcon"/>
              <span>Copy</span>
            </cck-trailing>
          </cck-form-field>
        </story-table-cell>

      </story-table>
`,
  }),
};
