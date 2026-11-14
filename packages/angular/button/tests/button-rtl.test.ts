import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CckButtonImports } from '../index';

const imports = [...CckButtonImports];

/** The keyboard rows are direction independent; these cases repeat them under `dir="rtl"`. */
describe('Button keyboard under dir="rtl"', () => {
  it('Enter and Space activate an enabled button', async () => {
    const onClick = vi.fn();
    await render(`<div dir="rtl"><button cckButton (click)="onClick()">Go</button></div>`, {
      imports,
      componentProperties: { onClick },
    });
    const user = userEvent.setup();
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('Tab and Shift+Tab move focus in and out, and skip a disabled button', async () => {
    await render(
      `<div dir="rtl"><input aria-label="before"><button cckButton>Go</button><button cckButton disabled>Off</button><input aria-label="after"></div>`,
      { imports },
    );
    const user = userEvent.setup();
    screen.getByLabelText('before').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('after'));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByLabelText('before'));
  });

  it('Enter follows an enabled link and Space does nothing', async () => {
    await render(`<div dir="rtl"><a cckButton href="#go">Go</a></div>`, { imports });
    const link = screen.getByRole('link');
    const clicks = vi.fn();
    link.addEventListener('click', clicks);
    link.focus();
    const user = userEvent.setup();
    await user.keyboard(' ');
    expect(clicks).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(clicks).toHaveBeenCalledTimes(1);
  });

  it('skips a disabled link and blocks Enter on it', async () => {
    const onClick = vi.fn();
    await render(
      `<div dir="rtl"><input aria-label="before"><a cckButton href="#go" disabled (click)="onClick()">Go</a><input aria-label="after"></div>`,
      { imports, componentProperties: { onClick } },
    );
    const user = userEvent.setup();
    screen.getByLabelText('before').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('after'));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByLabelText('before'));
    screen.getByRole('link').focus();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });
});
