import { Meta, StoryObj } from '@storybook/html';

export interface StoryType {
  text: string;
}
type Story = StoryObj<StoryType>;

const meta: Meta<StoryType> = {
  title: 'Button',
  argTypes: {
    text: { control: 'text' },
  },
  args: {
    text: 'DEFAULT TEXT',
  },
};

export default meta;

/**
 * This is the basic component
 */
export const Basic: Story = {
  args: {
    text: 'BASIC TEXT',
  },
  render: (args, _context) => renderElement('This is the Basic story', args.text),
};

export const Normal: Story = {
  args: {
    text: 'NORMAL TEXT',
  },
  render: (args, _context) => renderElement('This is the Normal story', args.text),
};

function renderElement(text: string, secondaryText: string) {
  const div = document.createElement('div');
  div.style.border = '1px solid #ccc';
  div.style.padding = '48px';
  div.innerHTML = `
            <span style="background: #444; color: #fff; padding: 12px 24px; font-size: 18px">${text}</span>
            <span style="background: #444; color: #fff; padding: 12px 24px; font-size: 18px">${secondaryText}</span>  
            <span class="button">COLOR</span>
        `;

  return div;
}
