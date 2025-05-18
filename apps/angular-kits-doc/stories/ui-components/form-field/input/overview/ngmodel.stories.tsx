import { FormsModule } from '@angular/forms';
import { InputComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';
import { moduleMetadata } from '@storybook/angular';

export const NgModel: StoryObj<InputComponent> = {
  name: 'NgModel',
  parameters: {
    docs: {
      description: {
        story: 'The input supports two-way data binding via `ngModel`, allowing real-time synchronization between user input and component data.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      controls: [CCK_CONTROL.type()],
      hasControl: false,
      source: [
        {
          filename: 'ng-model.component.ts',
          language: 'typescript',
          code: `
            import { Component } from '@angular/core';

            @Component({
              selector: 'ng-model-example',
              templateUrl: './ng-model.component.html',
            })
            export class NgModelExampleComponent {
              name = 'Default Name';
            }
          `,
        },
        {
          filename: 'ng-model.component.html',
          language: 'angular-html',
          code: `
            <cck-form-field>
              <cck-label>Name</cck-label>
              <input
                cckInput
                type="text"
                [(ngModel)]="name"
                placeholder="Enter your name"
              />
            </cck-form-field>
          `,
        },
      ],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field style="width: 100%">
        <cck-label>{{cckControl.label}}</cck-label>
        <input
          cckInput
          type="text"
          [(ngModel)]="name"
          placeholder="Placeholder"
        />
      </cck-form-field>
    `,
  }),
};
