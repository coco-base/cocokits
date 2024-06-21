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
  render: (args, _context) => {
    return renderElement('This is the Normal story', args.text);
  },
};

function renderElement(_text: string, _secondaryText: string) {
  const wrapper = document.createElement('div');

  const handleJsonUpdate = (event: unknown) => {
    const svgMap: Record<string, { name: string; content: string; viewBox: string }> = (event as CustomEvent).detail;

    const childElement = Object.values(svgMap).map((svgValue) => {
      return `
       <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #eee; border-radius: 4px; padding: 12px; gap: 8px; min-width: 120px; height: 50px">
         <svg width="24px" height="24px" focusable="false" aria-hidden="true" viewBox="${svgValue.viewBox}" tabindex="-1">
            ${svgValue.content}
         </svg>
         <span>${svgValue.name}</span>
       </div>
      `;
    });

    wrapper.innerHTML = childElement.join(' ');
    // Use event.detail here to update your story's display or behavior
  };

  window.addEventListener('update-json', handleJsonUpdate);

  wrapper.style.border = '1px solid #ccc';
  wrapper.style.padding = '48px';
  wrapper.style.display = 'flex';
  wrapper.style.gap = '4px';
  wrapper.style.flexWrap = 'wrap';
  // wrapper.innerHTML = `
  //           <span style="background: #444; color: #fff; padding: 12px 24px; font-size: 18px">${text}</span>
  //           <span style="background: #444; color: #fff; padding: 12px 24px; font-size: 18px">${secondaryText}</span>
  //           <span class="button">COLOR</span>
  //       `;

  return wrapper;
}
