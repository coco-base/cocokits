import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckHintImports } from '../../hint';
import { CckLabelImports } from '../../label';
import { CckFormFieldImports } from '../index';

const imports = [...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const story = `<div cckFormField>
  <label cckLabel for="email">Email address</label>
  <input id="email" type="email" aria-describedby="email-hint" />
  <div cckHint id="email-hint">We only use it for the receipt.</div>
</div>`;

describe('FormField accessibility', () => {
  it.each([
    ['label, input and hint', story],
    ['without a hint', `<div cckFormField><label cckLabel for="n">Name</label><input id="n" /></div>`],
    [
      'several hints',
      `<div cckFormField><label cckLabel for="n">Name</label><input id="n" aria-describedby="a b" /><div cckHint id="a">One</div><div cckHint id="b">Two</div></div>`,
    ],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names the control from the label and describes it from the hint', async () => {
    await render(story, { imports });
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input.getAttribute('aria-describedby')).toBe('email-hint');
    expect(document.getElementById('email-hint')?.textContent).toBe('We only use it for the receipt.');
  });

  it('moves focus to the control when the label is clicked', async () => {
    await render(story, { imports });
    await userEvent.setup().click(screen.getByText('Email address'));
    expect(document.activeElement?.id).toBe('email');
  });

  it('adds nothing focusable', async () => {
    const { container } = await render(story, { imports });
    expect(container.querySelectorAll('[tabindex], a[href], button')).toHaveLength(0);
  });
});
