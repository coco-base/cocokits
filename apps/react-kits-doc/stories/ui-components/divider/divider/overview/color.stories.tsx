import { Divider } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Divider> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('color')],
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
                 <% themeComponentConfig.color.values.map(color => { %>
                  <Divider
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  color="<%= color %>"/>
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
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <Divider key={index} type={args.cckControl.type} color={color} />
      ))}
    </>
  ),
};
