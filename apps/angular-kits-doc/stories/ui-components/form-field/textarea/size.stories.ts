import { TextareaComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<TextareaComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how the `size` property changes the appearance and spacing of the Textarea component, adapting it for various use cases.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.size.values.map(size => { %>
              <!-- <%= size %> -->
              <cck-form-field>
                <cck-label>Textarea - <%= size %></cck-label>
                <textarea
                  cckTextarea
                  size="<%= size %>"
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  placeholder="Write something..."
                ></textarea>
              </cck-form-field>
            <% }) %>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-form-field style="width: 100%; margin-bottom: 1rem;">
          <cck-label>Textarea - {{size}}</cck-label>
          <textarea
            cckTextarea
            placeholder="Write something..."
            [size]="size"
            [type]="cckControl.type"
          ></textarea>
        </cck-form-field>
      }
    `,
  }),
};
