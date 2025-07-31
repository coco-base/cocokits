import { Table } from '@cocokits/react-table';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Table> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Table } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.color.values.map(color => { %>
                  <Table
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    color='<%= color %>'
                  />
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
        <Table key={index} type={args.cckControl.type} color={color} />
      ))}
    </>
  ),
};
