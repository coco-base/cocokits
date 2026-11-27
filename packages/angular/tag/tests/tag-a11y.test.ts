import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckButtonImports } from '../../button';
import { CckSvgIconImports } from '../../svg-icon';
import { CckTagImports } from '../index';

const imports = [...CckTagImports, ...CckSvgIconImports, ...CckButtonImports];

describe('Tag accessibility', () => {
  it('is read as text where it is', async () => {
    await render(`<p>Invoice 42 <cck-tag>Paid</cck-tag></p>`, { imports });
    expect(screen.getByText('Paid').closest('.cck-tag')).not.toBeNull();
  });

  it('is announced as a status when the author writes role="status"', async () => {
    await render(`<cck-tag role="status">Saved</cck-tag>`, { imports });
    expect(screen.getByRole('status').textContent).toBe('Saved');
  });

  it.each([
    ['tag', `<cck-tag>Paid</cck-tag>`],
    ['empty', `<cck-tag></cck-tag>`],
    ['with an icon', `<cck-tag><cck-svg-icon iconName="check" />Passed</cck-tag>`],
    ['with role status', `<cck-tag role="status">Saved</cck-tag>`],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is not tabbable and leaves the Tab order unchanged', async () => {
    await render(
      `<button cckButton id="a">Before</button><cck-tag>Paid</cck-tag><button cckButton id="b">After</button>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement?.id).toBe('a');
    await user.tab();
    expect(document.activeElement?.id).toBe('b');
  });
});
