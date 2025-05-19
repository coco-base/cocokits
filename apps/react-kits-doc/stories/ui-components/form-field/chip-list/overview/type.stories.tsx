import { ChipList, FormField, Label } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof ChipList> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
         'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { FormField, Label, ChipList } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
            <>
              <% themeComponentConfig.type.values.map(type => { %>
              
                <FormField>
                <Label>Chip List</Label>
                <ChipList
                  chips={['Steak', 'Pizza']}
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                >
                </ChipList>
              </FormField>

              <% }) %>
            </>
              );
            }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <FormField key={index}>
          <Label>Chip List</Label>
          <ChipList chips={['Steak', 'Pizza']} type={type}  />
        </FormField>
      ))}
    </>
  ),
};
