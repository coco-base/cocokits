import { AvatarGroupComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<AvatarGroupComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-avatar-group
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color='<%= color %>'
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-avatar-group [type]="cckControl.type" [color]="color">
          <cck-avatar src="https://i.pravatar.cc?img=9"/>
          <cck-avatar src="https://i.pravatar.cc?img=10"/>
          <cck-avatar src="https://i.pravatar.cc?img=11"/>
        </cck-avatar-group>
      }
    `,
  }),
};
