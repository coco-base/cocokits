import { RadioButton } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof RadioButton> = {
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
                     import { RadioButton } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
          <% themeComponentConfig.type.values.map(type => { %>
            <RadioButton type='<%= type %>' value='YOUR_VALUE'>
              Radio Button - {type}
            </RadioButton>
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
        <RadioButton key={index} type={type} value={index} checked={true}>
          Radio Button - {type}
        </RadioButton>
      ))}
    </>
  ),
};
