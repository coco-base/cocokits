import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Textarea> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different type variations of the textarea to match various design contexts.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
              import { FormField, Label, Textarea } from "@cocokits/react-components";
              export const MyComponent = () => {
                return (
                  <>
                    <% themeComponentConfig.type.values.map(type => { %>
                      <FormField>
                        <Label><%= type %></Label>
                        <Textarea
                          <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                        >
                          <%= type %>
                        </Textarea>
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
          <Label>{type}</Label>
          <Textarea type={type} />
        </FormField>
      ))}
    </>
  ),
};
