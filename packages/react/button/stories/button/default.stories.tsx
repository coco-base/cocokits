import { StoryObj } from "@cocokits/storybook-addon-theme-react";
import Button from "../../src/lib/button";
import { reactThemeArgsToTemplate } from "@cocokits/storybook-addon-theme-react";
import { AddonParametersControlType } from "@cocokits/storybook-addon-theme";
import { SvgIcon } from "@cocokits/react-icon";


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
      source: [],
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
