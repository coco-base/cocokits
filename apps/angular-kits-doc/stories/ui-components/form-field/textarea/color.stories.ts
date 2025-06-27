import { TextareaComponent } from '@cocokits/angular-form-field';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<TextareaComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different color variations of the textarea.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-form-field>
              <cck-label><%= color %></cck-label>
              <textarea
                cckTextarea
                [color]='"<%= color %>"'
                placeholder="<%= color %>"
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
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-form-field>
          <cck-label>{{color}}</cck-label>
          <textarea cckTextarea [color]="color" [placeholder]="color"></textarea>
        </cck-form-field>
      }
    `,
  }),
};
