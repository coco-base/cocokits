import { Avatar } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const CustomTemplate: StoryObj<typeof Avatar> = {
  name: 'CustomTemplate',
  parameters: {
    docs: {
      description: {
        story: 'Shows an example of custom content.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { Avatar} from '@cocokits/react-components';

            export const MyComponent = () => {
              return (
                <Avatar
                  <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                  contentTemp={
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%', gap: '2px' }}>
                      <img src="https://i.pravatar.cc/100?img=5" alt="First Avatar" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      <img src="https://i.pravatar.cc/100?img=12" alt="Second Avatar" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                  }
                />
              )
            }        
          `,
        },
      ],
      hasControl: false,
      singleControls: ['size'],
      controls: [CCK_CONTROL.size()],
    },
  },
  render: (args) => (
    <Avatar
      size={args.cckControl.size}
      contentTemp={
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%', gap: '2px' }}>
          <img src="https://i.pravatar.cc/100?img=5" alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          <img src="https://i.pravatar.cc/100?img=12" alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>
      }
    />
  )
};
