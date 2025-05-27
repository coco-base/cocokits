import { AvatarLabelComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<AvatarLabelComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-avatar-label
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            title="<%= title %>"
            description="<%= description %>"
            avatarPosition="<%= avatarPosition %>"
            labelAlignment="<%= labelAlignment %>"
          >
            <cck-avatar src="<%= src %>"></cck-avatar>
          </cck-avatar-label>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.customText('Title', 'Alex Pearson'),
        CCK_CONTROL.customText('Description', 'UX Engineer'),
        CCK_CONTROL.srcUrl('https://i.pravatar.cc?img=52'),
        CCK_CONTROL.customSelect('Avatar Position', ['left', 'right', 'top', 'bottom']),
        CCK_CONTROL.customSelect('Label Alignment', ['vertical', 'horizontal']),
        CCK_CONTROL.additional(),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-avatar-label
          ${ngThemeArgsToTemplate(args)}
          [title]="cckControl.title"
          [description]="cckControl.description"
          [avatarPosition]="cckControl.avatarPosition"
          [labelAlignment]="cckControl.labelAlignment"
        >
          <cck-avatar [src]="cckControl.src"/>
        </cck-avatar-label>
      `,
    };
  },
};
