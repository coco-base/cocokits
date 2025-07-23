import { moduleMetadata } from '@storybook/angular';

import { AvatarComponent, AvatarLabelComponent } from '@cocokits/angular-avatar';
import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { IconButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Integration: StoryObj<BadgeContainerComponent> = {
  name: 'Integration',
  decorators: [
    moduleMetadata({
      imports: [IconButtonComponent, SvgIconComponent, AvatarComponent, AvatarLabelComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Badges attached to interactive components.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-badge-container position="top-right">
              <button cck-icon-button>
                <cck-svg-icon [icon]="Icons.heartFill"/>
              </button>
              <cck-badge <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %> content="2"/>
            </cck-badge-container>

            <cck-badge-container position="bottom-right" radius="50%">
              <cck-avatar src="https://i.pravatar.cc?img=9"/>
              <cck-badge <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %> content="2"/>
            </cck-badge-container>

            <cck-badge-container position="top-right" radius="50%">
              <cck-avatar src="https://i.pravatar.cc?img=10"/>
              <cck-badge <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>/>
            </cck-badge-container>

            <cck-avatar-label title="Alex Pearson" description="UX Engineer">
              <cck-badge-container position="bottom-right" radius="50%">
                <cck-avatar src="https://i.pravatar.cc?img=11"/>
                <cck-badge <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>/>
              </cck-badge-container>
            </cck-avatar-label>
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
      <cck-badge-container position="top-right">
        <button cck-icon-button>
          <cck-svg-icon [icon]="cckIcons.heartFill"/>
        </button>
        <cck-badge [type]="cckControl.type" content="2"/>
      </cck-badge-container>

      <cck-badge-container position="bottom-right" radius="50%">
        <cck-avatar src="https://i.pravatar.cc?img=9"/>
        <cck-badge [type]="cckControl.type" content="2"/>
      </cck-badge-container>

      <cck-badge-container position="top-right" radius="50%">
        <cck-avatar src="https://i.pravatar.cc?img=10"/>
        <cck-badge [type]="cckControl.type"/>
      </cck-badge-container>

      <cck-avatar-label title="Alex Pearson" description="UX Engineer">
        <cck-badge-container position="bottom-right" radius="50%">
          <cck-avatar src="https://i.pravatar.cc?img=11"/>
          <cck-badge [type]="cckControl.type"/>
        </cck-badge-container>
      </cck-avatar-label>
    `,
  }),
};
