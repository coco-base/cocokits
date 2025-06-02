import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@cocokits/angular-form-field';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

export const WithNgModel: StoryObj<SelectComponent> = {
  name: 'With ngModel',
  parameters: {
    docs: {
      description: {
        story: 'Use ngModel with the select component to enable two-way data binding.',
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
              <cck-label>Select your food</cck-label>
              <cck-select 
                [(ngModel)]="selectedValue" 
                placeholder="Tap to select food">
                <cck-option value="Steak">Steak</cck-option>
                <cck-option value="Pizza">Pizza</cck-option>
                <cck-option value="Burger">Burger</cck-option>
              </cck-select>
            </cck-form-field>
            
            <p style="margin-top: 1rem;">
              You selected: <strong>{{ selectedValue }}</strong>
            </p>
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
  render: () => ({
    props: {
      selectedValue: 'Pizza',
    },
    template: `
      <cck-form-field>
        <cck-label>Select your food</cck-label>
        <cck-select 
          [(ngModel)]="selectedValue" 
          placeholder="Tap to select food">
          <cck-option value="Steak">Steak</cck-option>
          <cck-option value="Pizza">Pizza</cck-option>
          <cck-option value="Burger">Burger</cck-option>
        </cck-select>
      </cck-form-field>

      <p style="margin-top: 1rem;">
        You selected: <strong>{{ selectedValue }}</strong>
      </p>
    `,
  }),
};
