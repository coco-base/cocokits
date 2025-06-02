import { TextareaComponent } from '@cocokits/angular-form-field';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<TextareaComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different size variations of the textarea.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.size.values.map(size => { %>
            <cck-form-field>
              <cck-label><%= size %></cck-label>
              <textarea
                cckTextarea
                [size]='"<%= size %>"'
                placeholder="<%= size %>"
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
      @for (size of cckControl.themeComponentConfig.size.values; let index = $index; track size) {
        <cck-form-field>
          <cck-label>{{size}}</cck-label>
          <textarea cckTextarea [size]="size" [placeholder]="size"></textarea>
        </cck-form-field>
      }
    `,
  }),
};
