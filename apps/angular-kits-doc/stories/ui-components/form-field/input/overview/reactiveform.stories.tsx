import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';
import { moduleMetadata } from '@storybook/angular';

export const ReactiveFormBinding: StoryObj<InputComponent> = {
  name: 'ReactiveFormBinding',
  parameters: {
    docs: {
      description: {
        story:
          "The input component works seamlessly with Angular's reactive forms. Use `formControl` or `formControlName` to bind it to form controls for validation and data handling.",
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'reactive-form.component.ts',
          language: 'typescript',
          code: `
            name = new FormControl('');
          `,
        },
        {
          filename: 'reactive-form.component.html',
          language: 'angular-html',
          code: `
            <cck-form-field>
              <cck-label>Name</cck-label>
              <input
                cckInput
                type="text"
                [formControl]="name"
                placeholder="Enter your name"
              />
            </cck-form-field>
            <p>You typed: {{ name.value }}</p>
          `,
        },
      ],
      hasControl: false,
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
      name: new FormControl(''),
    },
    template: `
      <cck-form-field style="width: 100%">
        <cck-label>Name</cck-label>
        <input
          cckInput
          type="text"
          [formControl]="name"
          placeholder="Placeholder"
        />
      </cck-form-field>
      <p>You typed: {{ name.value }}</p>
    `,
  }),
};
