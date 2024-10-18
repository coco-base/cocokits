import { FormControl } from '@angular/forms';

import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src';

export const ReactiveForm: AngularStoryObj<ToggleComponent> = {
  name: 'ReactiveForm',
  parameters: {
    docs: {
      description: {
        story: `Illustrates integration within Angular's Reactive Forms, focusing on form control, validation, and efficient state management.`,
      },
      source: {
        code: `
          <cck-toggle [formControl]="control">Slide me!</cck-toggle>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      control: new FormControl(true),
    },
    template: `
      <story-columns>
        <story-column>
          <cck-toggle [formControl]="control"></cck-toggle>
        </story-column>
        
        <story-column>
          <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
          <button class="story-button" (click)="control.reset()">Reset</button>
          <button class="story-button" (click)="control.setValue(true)">Set To True</button>
          <button class="story-button" (click)="control.setValue(false)">Set to False</button>
          <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
        </story-column>
      </story-columns>
    `,
  }),
};
