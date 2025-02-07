import { Divider } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Divider> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('type')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            <>
              <% themeComponentConfig.type.values.map(type => { %>
                <Divider type='<%= type %>'/>
              <% }) %>
            </>
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      { args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <div key={index} style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
          <Divider type={type}/>
        </div>
      )) }
    </>
  )
};
