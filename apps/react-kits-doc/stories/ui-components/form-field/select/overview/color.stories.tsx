
import { ElementAnchorPoint } from '@cocokits/common-utils';
import { FormField, Label, Option, Select } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import {  StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Select> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'The color is adjustable to match the design language or emphasize the Select field in the form',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'),renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Option, Select } from "@cocokits/react-components";

            export const MyComponent = () => {
              return (
                <>
                  <% themeComponentConfig.color.values.map(color => { %>
                    <FormField style={{ marginBottom: '1rem' }}>
                      <Label>Color: <%= color %></Label>
                      <Select
                        color="<%= color %>"
                        <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                      >
                        <Option value="Steak">Steak</Option>
                        <Option value="Pizza">Pizza</Option>
                        <Option value="Burger">Burger</Option>
                      </Select>
                    </FormField>
                  <% }) %>
                </>
              );
            }
          `,
        },
      ],
      controls: [
        CCK_CONTROL.type(),
      ],
    },
  },

  render: (args) => (     
       
    <>
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <FormField key={index} style={{ minWidth: '200px' }}>
          <Label>Color: {color}</Label>
          <Select
            color={color}
            type={args.cckControl.type}
            anchorPoint={ElementAnchorPoint.BottomLeft}
          >
            <Option value="Steak">Steak</Option>
            <Option value="Pizza">Pizza</Option>
            <Option value="Burger">Burger</Option>
          </Select>
        </FormField>
      ))}
    </>
  ),
};
