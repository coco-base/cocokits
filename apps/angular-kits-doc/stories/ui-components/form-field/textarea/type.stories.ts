import { TextareaComponent } from '@cocokits/angular-form-field';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<TextareaComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different type variations of the textarea.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.type.values.map(type => { %>
            <cck-form-field>
              <cck-label><%= type %></cck-label>
              <textarea
                cckTextarea 
                [type]='"<%= type %>"'
                placeholder="<%= type %>"
              ></textarea>
            </cck-form-field>
          <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (type of cckControl.themeComponentConfig.type.values; let index = $index; track type) {
        <cck-form-field>
          <cck-label>{{type}}</cck-label>
          <textarea cckTextarea [type]="type" [placeholder]="type"></textarea>
        </cck-form-field>
      }
    `,
  }),
};
