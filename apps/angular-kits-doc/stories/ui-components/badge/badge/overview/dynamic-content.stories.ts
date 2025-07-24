import { BadgeComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const DynamicContent: StoryObj<BadgeComponent> = {
  name: 'Dynamic Content',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates text, numeric, and dot states in a single view.',
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
            <cck-badge type="<%= type %>" />
            <cck-badge type="<%= type %>" content="5"/>
            <cck-badge type="<%= type %>" content="20" max="10"/>
            <cck-badge type="<%= type %>" content="Online"/>
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
      <cck-badge [type]="cckControl.type" />
      <cck-badge [type]="cckControl.type" content="5"/>
      <cck-badge [type]="cckControl.type" content="20" max="10"/>
      <cck-badge [type]="cckControl.type" content="Online"/>
    `,
  }),
};
