import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof IconButton> = {
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
          import { IconButton , SvgIcon } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.size.values.map(size => { %>
                  <IconButton
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    size='<%= size %>'
                  >
                    <SvgIcon icon={YOUR_ICON} />
                  </IconButton>
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
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <IconButton key={index} type={args.cckControl.type} size={size}>
          <SvgIcon icon={args.cckIcons.heartFill} />
        </IconButton>
      ))}
    </>
  ),
};
