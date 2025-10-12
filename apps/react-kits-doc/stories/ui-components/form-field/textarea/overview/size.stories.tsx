import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Textarea> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different size variations of the textarea to match various design contexts.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
              import { FormField, Label, Textarea } from "@cocokits/react-components";

              export const MyComponent = () => {
                return (
                  <>
                    <% themeComponentConfig.size.values.map(size => { %>
                      <FormField>
                        <Label><%= size %></Label>
                        <Textarea
                          <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                        >
                          <%= size %>
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
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <FormField key={index}>
          <Label>{size}</Label>
          <Textarea size={size} />
        </FormField>
      ))}
    </>
  ),
};
