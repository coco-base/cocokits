import { AvatarGroupComponent } from '@cocokits/angular-avatar';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<AvatarGroupComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique Avatar styles.',
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
            <cck-avatar-group
              type='<%= type %>'
            >
              <cck-avatar src="https://i.pravatar.cc?img=9"/>
              <cck-avatar src="https://i.pravatar.cc?img=10"/>
              <cck-avatar src="https://i.pravatar.cc?img=11"/>
              <cck-avatar src="https://i.pravatar.cc?img=12"/>
            </cck-avatar-group>
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
      @for (type of cckControl.themeComponentConfig?.type?.values; let col = $index; track type) {
        <cck-avatar-group [type]="type">
          <cck-avatar src="https://i.pravatar.cc?img=9"/>
          <cck-avatar src="https://i.pravatar.cc?img=10"/>
          <cck-avatar src="https://i.pravatar.cc?img=11"/>
        </cck-avatar-group>
      }
    `,
  }),
};
