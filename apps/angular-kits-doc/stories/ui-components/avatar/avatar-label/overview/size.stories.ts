import { AvatarLabelComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<AvatarLabelComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
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
            <cck-avatar-label
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
              size='<%= size %>'
              title="Alex Pearson"
              description="UX Engineer"
            >
              <cck-avatar src="https://i.pravatar.cc?img=52" />
            </cck-avatar-label>
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
      @for (size of cckControl.themeComponentConfig?.size?.values; let col = $index; track size) {
        <cck-avatar-label
          [type]="cckControl.type"
          [size]="size"
          title="Alex Pearson"
          description="UX Engineer">
            <cck-avatar src="https://i.pravatar.cc?img=52"/>
        </cck-avatar-label>
      }
    `,
  }),
};
