import { FormField, Input, Label } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Input> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'The color is adjustable to match the design language or emphasize the Select field in the form',
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
                  <% themeComponentConfig.color.values.map(color => { %>
                    {/* <%= color %> */}
                    <FormField>
                      <Label>Color: <%= color %></Label>
                      <Input color="<%= color %>" />
                    </FormField>
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
        <FormField key={index} style={{ minWidth: '200px'}}>
          <Label>Color: {color}</Label>
          <Input color={color} />
        </FormField>
      ))}
    </>
  ),
};
