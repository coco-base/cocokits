import { RadioButton } from '@cocokits/react-components';
import { AddonParametersControlType, CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof RadioButton> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          <>
            <% themeComponentConfig.size.values.map((size, index) => { %>

              {/* <%= size %> */}
              <RadioButton
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                size='<%= size %>'
                value='YOUR_VALUE'>
                Radio Button - <%= size %>
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
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <RadioButton key={index} type={args.cckControl.type} size={size} value={index} checked={true}>
          Radio Button - {size}
        </RadioButton>
      ))}
    </>
  )
};
