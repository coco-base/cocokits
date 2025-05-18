import { AvatarComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<AvatarComponent> = {
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
          
          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.type(), CCK_CONTROL.color(), CCK_CONTROL.size(), CCK_CONTROL.additional()],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-avatar
          ${ngThemeArgsToTemplate(args)}>
            
        </cck-avatar>
      `,
    };
  },
};
