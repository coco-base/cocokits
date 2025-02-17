import { RadioButton } from '@cocokits/react-radio';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof RadioButton> = {
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
            <% themeComponentConfig.color.values.map((color, index) => { %>

              {/* <%= color %> */}
              <RadioButton
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                color='<%= color %>'
                value='YOUR_VALUE'>
                Radio Button - <%= color %>
              </RadioButton>
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
        <RadioButton key={index} type={args.cckControl.type} color={color} value={index} checked={true}>
          Radio Button - {color}
        </RadioButton>
      ))}
    </>
  ),
};
