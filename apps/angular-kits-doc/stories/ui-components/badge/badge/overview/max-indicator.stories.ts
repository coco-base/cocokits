import { BadgeComponent } from '@cocokits/angular-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const MaxIndicator: StoryObj<BadgeComponent> = {
  name: 'Max Indicator',
  parameters: {
    docs: {
      description: {
        story: 'Shows how numbers automatically convert to {max}+ format when exceeding the limit.',
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
            <cck-badge [type]="cckControl.type" content="5000" max="9"/>
            <cck-badge [type]="cckControl.type" content="5000" max="20"/>
            <cck-badge [type]="cckControl.type" content="5000" max="99"/>
            <cck-badge [type]="cckControl.type" content="5000" max="999"/>
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
      <cck-badge [type]="cckControl.type" content="5000" max="9"/>
      <cck-badge [type]="cckControl.type" content="5000" max="20"/>
      <cck-badge [type]="cckControl.type" content="5000" max="99"/>
      <cck-badge [type]="cckControl.type" content="5000" max="999"/>
    `,
  }),
};
