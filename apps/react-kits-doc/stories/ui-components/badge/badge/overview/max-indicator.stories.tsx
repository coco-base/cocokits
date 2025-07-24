import { Badge } from '@cocokits/react-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const MaxIndicator: StoryObj<typeof Badge> = {
  name: 'MaxIndicator',
  parameters: {
    docs: {
      description: {
        story:
          'Shows how numbers automatically convert to {max}+ format when exceeding the limit.',
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
                <Badge type='<%= type %>' content="5000" max={9}/>
                <Badge type='<%= type %>' content="5000" max={20}/>
                <Badge type='<%= type %>' content="5000" max={99}/>
                <Badge type='<%= type %>' content="5000" max={999}/>
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
      <Badge type={args.cckControl.type} content="5000" max={9}/>
      <Badge type={args.cckControl.type} content="5000" max={20}/>
      <Badge type={args.cckControl.type} content="5000" max={99}/>
      <Badge type={args.cckControl.type} content="5000" max={999}/>
    </>
  ),
};
