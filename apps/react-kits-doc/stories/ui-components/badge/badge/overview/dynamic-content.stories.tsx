import { Badge } from '@cocokits/react-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const DynamicContent: StoryObj<typeof Badge> = {
  name: 'DynamicContent',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates text, numeric, and dot states in a single view.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Badge } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <Badge type="<%= type %>"/>
                <Badge type="<%= type %>" content="5"/>
                <Badge type="<%= type %>" content="20" max={10}/>
                <Badge type="<%= type %>" content="online"/>
              </>

            );
          }
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      <Badge type={args.cckControl.type}/>
      <Badge type={args.cckControl.type} content="5"/>
      <Badge type={args.cckControl.type} content="20" max={10}/>
      <Badge type={args.cckControl.type} content="online"/>
    </>
  ),
};
