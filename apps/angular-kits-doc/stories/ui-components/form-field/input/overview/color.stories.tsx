import { InputComponent } from '@cocokits/angular-form-field';
import {  CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-angular';


export const Color: StoryObj<InputComponent> = {
    name: 'Color',
    parameters: {
      docs: {
        description: {
          story: 'Displays how different colors affect the input style.',
        },
      },
      cckAddon: {
        renderConditions: [renderWithThemeProp('color'),renderWithPageTab('Overview')],
        singleControls: ['type'],
        source: [
          {
            filename: 'color.component.html',
            language: 'angular-html',
            code: `
              <cck-form-field>
                <cck-label>Input Color</cck-label>
                <input
                  cckInput
                  color="<%= color %>"
                  placeholder="Type something"
                />
              </cck-form-field>
            `,
          },
        ],
        controls: [CCK_CONTROL.type()],
      },
    },
    render: (args) => ({
      props: { ...args },
      template: `
        <cck-form-field style="width: 100%">
        <cck-label>{{cckControl.label}}</cck-label>
          <input
            cckInput
            [color]="cckControl.color"
            placeholder="Placeholder"
          />
        </cck-form-field>
      `,
    }),
  };
  