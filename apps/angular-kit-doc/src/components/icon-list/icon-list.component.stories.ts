import { action } from '@storybook/addon-actions';
import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { IconListComponent } from './icon-list.component';

type StoryType = IconListComponent & Record<string, unknown>;

const meta: Meta<StoryType> = {
  title: 'icon',
  component: IconListComponent,
  // tags: ['autodocs'],
  // render: (args) => {
  //   const props = {
  //     ...args,
  //     counterChanged: (counter: number) => {
  //       console.log('STORY counterChanged', counter);
  //       action('counter changed')(counter);
  //     },
  //   };
  //   return {
  //     props,
  //     template: `
  //     <cck-task ${argsToTemplate(props)}>
  //     </cck-task>
  //   `,
  //   };
  // },
  // render: (args) => ({
  //   props: {
  //     ...args,
  //     counterChanged: (counter: number) => {
  //       console.log('STORY COUNTER', counter);
  //       action('counter changed')(counter);
  //     },
  //   },
  //   template: `
  //     <cck-task ${argsToTemplate(args)}>
  //     </cck-task>
  //   `,
  // }),
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  // args: {
  //   title: 'STORY TITLE',
  //   ratio: 0.2
  // },
};
