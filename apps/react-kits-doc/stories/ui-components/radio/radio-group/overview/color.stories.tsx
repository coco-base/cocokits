import { RadioButton, RadioGroup } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof RadioGroup> = {
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
          <>
            <% themeComponentConfig.color.values.map(color => { %>

              <RadioGroup
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                color="<%= color %>">
                <RadioButton value="Radio-1">Radio Button 1</RadioButton>
                <RadioButton value="Radio-2">Radio Button 2</RadioButton>
                <RadioButton value="Radio-3">Radio Button 3</RadioButton>
              </RadioGroup>
            <% }) %>
          </>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <RadioGroup key={index} type={args.cckControl.type} color={color}>
          <RadioButton value="Radio-1">Radio Button 1</RadioButton>
          <RadioButton value="Radio-2">Radio Button 2</RadioButton>
          <RadioButton value="Radio-3">Radio Button 3</RadioButton>
        </RadioGroup>
      ))}
    </>
  )
};
