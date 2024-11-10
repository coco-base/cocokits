import Button from '../../src/lib/button';
import { ReactStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfig } from '@cocokits/storybook-theme-switcher';
import descriptionMd from './description.md?raw';

export { Default as Primary } from './default.stories';

const meta: ReactStoriesMeta<typeof Button> = {
  component: Button,
  title: 'UI Components/Button',
  tags: ['autodocs'],
  decorators: [withThemeConfig],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
  argTypes: {},
};
export default meta;