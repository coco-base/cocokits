import { FormField, Input, Label } from '@cocokits/react-form-field';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Input> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
               'The type prop adjusts the visual style of the Select component, allowing for different UI purposes like default, secondary, or ghost.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'),renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { FormField, Label, Input } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  {/* <%= type %> */}
                  <FormField>
                    <Label><%= type %> input</Label>
                    <Input type="<%= type %>" />
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
        <FormField key={index} style={{ minWidth: '200px' }}>
          <Label>{type} input</Label>
          <Input type={type} />
        </FormField>
      ))}
    </>
  ),
};
