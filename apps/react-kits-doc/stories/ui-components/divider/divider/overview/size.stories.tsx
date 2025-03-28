import { Divider } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Divider> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('size')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { Divider } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
                    <% themeComponentConfig.size.values.map(size => { %>
                <Divider
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  size="<%= size %>"/>
              <% }) %>
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
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <Divider key={index} type={args.cckControl.type} size={size} />
      ))}
    </>
  ),
};
