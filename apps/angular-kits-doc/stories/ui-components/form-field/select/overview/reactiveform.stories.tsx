import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SelectComponent } from '@cocokits/angular-form-field';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

export const ReactiveForm: StoryObj<SelectComponent> = {
  name: 'With ReactiveForms',
  parameters: {
    docs: {
      description: {
        story: 'Integration with Angular Reactive Forms using FormControl.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-form-field>
              <cck-label>Favorite food</cck-label>
              <cck-select [formControl]="foodControl" placeholder="Pick one">
                <cck-option value="Steak">Steak</cck-option>
                <cck-option value="Pizza">Pizza</cck-option>
                <cck-option value="Burger">Burger</cck-option>
              </cck-select>
            </cck-form-field>
          `.trim(),
        },
        {
          filename: 'example.component.ts',
          language: 'typescript',
          code: `
            import { FormControl } from '@angular/forms';

            export class ExampleComponent {
              foodControl = new FormControl('Pizza');
            }
          `.trim(),
        },
      ],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  render: (args) => {
    const foodControl = new FormControl('Pizza');

    return {
      props: {
        foodControl,
        ...args,
      },
      template: `
        <cck-form-field style="width: 300px;">
          <cck-label>Favorite food</cck-label>
          <cck-select
            placeholder="Pick one"
            [formControl]="foodControl"
            [type]="cckControl.type">
            <cck-option value="Steak">Steak</cck-option>
            <cck-option value="Pizza">Pizza</cck-option>
            <cck-option value="Burger">Burger</cck-option>
          </cck-select>
        </cck-form-field>
      `,
    };
  },
};
