import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Textarea> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different color variations of the textarea to match various design contexts.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
              import { FormField, Label, Textarea } from "@cocokits/react-components";
              export const MyComponent = () => {
                return (
                  <>
                    <% themeComponentConfig.color.values.map(color => { %>
                      <FormField>
                        <Label><%= color %></Label>
                        <Textarea
                          color="<%= color %>"
                          <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                        >
                          <%= color %>
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
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <FormField key={index}>
          <Label>{color}</Label>
          <Textarea color={color} />
        </FormField>
      ))}
    </>
  ),
};
