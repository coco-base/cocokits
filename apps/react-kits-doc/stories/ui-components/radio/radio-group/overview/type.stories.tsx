import { RadioButton, RadioGroup } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof RadioGroup> = {
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
            <>
              <% themeComponentConfig.type.values.map(type => { %>
                <RadioGroup type="<%= type %>">
                  <RadioButton value="Radio-1">Radio Button 1</RadioButton>
                  <RadioButton value="Radio-2">Radio Button 2</RadioButton>
                  <RadioButton value="Radio-3">Radio Button 3</RadioButton>
                </RadioGroup>
              <% }) %>
            </>
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <RadioGroup key={index} type={type}>
          <RadioButton value="Radio-1">Radio Button 1</RadioButton>
          <RadioButton value="Radio-2">Radio Button 2</RadioButton>
          <RadioButton value="Radio-3">Radio Button 3</RadioButton>
        </RadioGroup>
      ))}
    </>
  )
};
