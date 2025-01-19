import { StoryObj } from "@cocokits/storybook-addon-theme-react";
import { reactThemeArgsToTemplate } from "@cocokits/storybook-addon-theme-react";
import { AddonParametersControlType, renderWithPageTab } from "@cocokits/storybook-addon-theme";
import { SvgIcon } from "@cocokits/react-icon";
import { Button } from "@cocokits/react-button";

export const Default: StoryObj<typeof Button> = {
  name: "Default",
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'exampleComponent.tsx',
          language: 'tsx',
          code: `

          import { Button, SvgIcon} from '@cocokits/react-components';
import { Example1 } from './examples/examples.stories';

          export const MyComponent = () => {
            return (
              <Button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled={true} <% } %>
              >
                <% if (leftIcon !== 'none') { %>
                  <SvgIcon icon="YOUR_ICON"/>
                <% } %>
                <%= text %>
                <% if (rightIcon !== 'none') { %>
                  <SvgIcon icon="YOUR_ICON"/>
                <% } %>
              </Button>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        { displayName: 'Text', default: 'Button', storyArgKey: 'text', type: AddonParametersControlType.Text },
        {
          displayName: 'Left Icon',
          default: 'heartFill',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'leftIcon',
          type: AddonParametersControlType.Icon,
        },
        {
          displayName: 'Right Icon',
          default: 'none',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'rightIcon',
          type: AddonParametersControlType.Icon,
        },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
      ]
    }
  },
  args: {
  },
  render: (args) => (
    <Button
      {...reactThemeArgsToTemplate(args)}
      disabled={args.cckControl.disabled}
    >
      { args.cckControl.leftIcon !== 'none' && <SvgIcon icon={args.cckIcons[args.cckControl.leftIcon]} /> }
      {args.cckControl.text}
      { args.cckControl.rightIcon !== 'none' && <SvgIcon icon={args.cckIcons[args.cckControl.rightIcon]} /> }
    </Button>
  )
};
