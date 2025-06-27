import { InputComponent } from '@cocokits/angular-form-field';
import {  renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-angular';


export const Type: StoryObj<InputComponent> = {
    name: 'Type',
    parameters: {
      docs: {
        description: {
          story:'The type prop adjusts the visual style of the Select component, allowing for different UI purposes like default, secondary, or ghost.',
        },
      },
      cckAddon: {
        renderConditions: [renderWithThemeProp('type'),renderWithPageTab('Overview')],
        source: [
          {
            filename: 'type.component.html',
            language: 'angular-html',
            code: `
              <cck-form-field>
                <cck-label>Input Type</cck-label>
                <input
                  cckInput
                  type="<%= type %>"
                  placeholder="Enter value"
                />
              </cck-form-field>
            `,
          },
        ],
      },
    },
    render: (args) => ({
      props: { ...args },
      template: `
        <cck-form-field style="width: 100%">
         <cck-label>{{cckControl.label}}</cck-label>
          <input
            cckInput
            [type]="cckControl.type"
            placeholder="Placeholder"
          />
        </cck-form-field>
      `,
    }),
  };
  