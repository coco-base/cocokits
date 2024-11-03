import { ReactStoryObj } from "@cocokits/internal-model";
import Button from "../../src/lib/button";
import { action } from '@storybook/addon-actions';


export const Default: ReactStoryObj<typeof Button> = {
  name: "Default",
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <Button>Button</Button>
          <Button disabled>Button</Button>
        `,
      },
    },
  },
  args: {
    onClick: action('on-click')
  },
  render: (args) => (
    <>
      <Button {...args}>Button</Button>
      <Button disabled {...args}>Button</Button>
    </>
  )
};
