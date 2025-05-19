import { InputComponent } from '@cocokits/angular-form-field';
import {  CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-angular';


export const Size: StoryObj<InputComponent> = {
    name: 'Size',
    parameters: {
      docs: {
        description: {
            story:
             'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
        },
      },
      cckAddon: {
        renderConditions: [renderWithThemeProp('size'),renderWithPageTab('Overview')],
        singleControls: ['type'],
        source: [
          {
            filename: 'size.component.html',
            language: 'angular-html',
            code: `
              <cck-form-field>
                <cck-label>Input Size</cck-label>
                <input
                  cckInput
                  size="<%= size %>"
                  placeholder="Type something"
                />
              </cck-form-field>
            `,
          },
        ],
        hasControl: true,
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
            [size]="cckControl.size"
            placeholder="Type something"
          />
        </cck-form-field>
      `,
    }),
  };
  