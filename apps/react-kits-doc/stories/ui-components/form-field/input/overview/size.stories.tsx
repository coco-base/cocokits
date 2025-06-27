import { FormField, Input, Label } from '@cocokits/react-form-field';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Input> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
        'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'),renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Input } from "@cocokits/react-components";

            export const MyComponent = () => {
              return (
                <>
                  <% themeComponentConfig.size.values.map(size => { %>
                    {/* <%= size %> */}
                    <FormField>
                      <Label>Size: <%= size %></Label>
                      <Input size="<%= size %>" />
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
      {args.cckControl.themeComponentConfig.size?.values.map((type, index) => (
        <FormField key={index} style={{ minWidth: '200px' }}>
          <Label>{type} input</Label>
          <Input type={type} />
        </FormField>
      ))}
    </>
  ),
};
