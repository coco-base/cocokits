import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';
import descriptionMd from './description.md?raw';
import { Button } from '@cocokits/react-button';

export { Default } from './default.stories';
export { VolumeButtonStory } from './examples/volume-button/_volume-button.stories';
// export { Example1, Example2, Example3, Example4, Example5, Example6, Example7, Example8, Example9, Example10, Example11, Example12, Example13, Example14, Example15, Example16, Example17, Example18, Example19, Example20, Example21, Example22, Example23, Example24, Example25, Example26, Example27, Example28, Example29, Example30, Example31, Example32, Example33, Example34, Example35, Example36, Example37, Example38, Example39, Example40, Example41, Example42, Example43, Example44, Example45, Example46, Example47, Example48, Example49, Example50, Example51, Example52, Example53, Example54, Example55, Example56, Example57, Example58, Example59, Example60 } from './examples/examples.stories';

const meta: StoriesMeta<typeof Button> = {
  component: Button,
  title: 'UI Components/Button',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'button',
    }
  },
  argTypes: {},
};
export default meta;