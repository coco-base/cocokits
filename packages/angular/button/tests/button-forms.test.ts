import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CckButtonImports } from '../index';

const imports = [...CckButtonImports];

/** Collects what a submit event carries, and stops jsdom from navigating. */
function onSubmit(): ReturnType<typeof vi.fn> {
  return vi.fn((event: SubmitEvent) => {
    event.preventDefault();
  });
}

function submitted(handler: ReturnType<typeof vi.fn>): FormData {
  const event = handler.mock.calls[0]?.[0] as SubmitEvent;
  return new FormData(event.target as HTMLFormElement, event.submitter);
}

describe('Button in a real form', () => {
  it('submits an outside form through the form attribute', async () => {
    const handler = onSubmit();
    await render(
      `<form id="f" (submit)="handler($event)"></form><button cckButton type="submit" form="f">Go</button>`,
      { imports, componentProperties: { handler } },
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sends the submitter name and value', async () => {
    const handler = onSubmit();
    await render(
      `<form (submit)="handler($event)"><button cckButton type="submit" name="action" value="save">Save</button><button cckButton type="submit" name="action" value="draft">Draft</button></form>`,
      { imports, componentProperties: { handler } },
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Draft' }));
    expect(submitted(handler).get('action')).toBe('draft');
  });

  it('keeps the form* overrides on the element', async () => {
    const handler = onSubmit();
    await render(
      `<form action="/a" method="get" (submit)="handler($event)"><button cckButton type="submit" formaction="/b" formmethod="post" formtarget="_blank" formenctype="text/plain">Go</button></form>`,
      { imports, componentProperties: { handler } },
    );
    const button = screen.getByRole<HTMLButtonElement>('button');
    expect(button.getAttribute('formaction')).toBe('/b');
    expect(button.getAttribute('formmethod')).toBe('post');
    expect(button.getAttribute('formtarget')).toBe('_blank');
    expect(button.getAttribute('formenctype')).toBe('text/plain');
    await userEvent.setup().click(button);
    const event = handler.mock.calls[0]?.[0] as SubmitEvent;
    expect(event.submitter).toBe(button);
  });

  it('blocks submit on an invalid form and keeps formnovalidate', async () => {
    const handler = onSubmit();
    await render(
      `<form (submit)="handler($event)"><input aria-label="Name" required><button cckButton type="submit">Go</button><button cckButton type="submit" formnovalidate>Skip</button></form>`,
      { imports, componentProperties: { handler } },
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Go' }));
    expect(handler).not.toHaveBeenCalled();
    // jsdom does not honour formnovalidate on click, so only the attribute is asserted.
    expect(screen.getByRole('button', { name: 'Skip' }).hasAttribute('formnovalidate')).toBe(true);
  });

  it('leaves a disabled submitter out of the submission', async () => {
    const handler = onSubmit();
    await render(
      `<form (submit)="handler($event)"><input aria-label="Name" name="n" value="x"><button cckButton type="submit" name="action" value="save" disabled>Save</button></form>`,
      { imports, componentProperties: { handler } },
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
    const form = document.querySelector('form');
    if (!form) throw new Error('no form');
    expect(new FormData(form).has('action')).toBe(false);
  });

  describe('inside <fieldset disabled>', () => {
    const template = `<input aria-label="before"><fieldset disabled><button cckButton (click)="onClick()">Go</button><a cckButton href="#go" (click)="onLink()">Link</a></fieldset><input aria-label="after">`;

    it('disables the button natively, without data-disabled', async () => {
      await render(template, { imports, componentProperties: { onClick: vi.fn() } });
      const button = screen.getByRole('button');
      expect(button.matches(':disabled')).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.hasAttribute('data-disabled')).toBe(false);
    });

    it('is skipped by Tab and Shift+Tab and fires no click', async () => {
      const onClick = vi.fn();
      await render(template, { imports, componentProperties: { onClick } });
      const user = userEvent.setup();
      screen.getByLabelText('before').focus();
      await user.tab();
      expect(document.activeElement).not.toBe(screen.getByRole('button'));
      await user.tab({ shift: true });
      expect(document.activeElement).not.toBe(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not disable a link: it stays focusable and activates', async () => {
      const onLink = vi.fn();
      await render(template, { imports, componentProperties: { onClick: vi.fn(), onLink } });
      const link = screen.getByRole('link');
      expect(link.hasAttribute('aria-disabled')).toBe(false);
      expect(link.hasAttribute('data-disabled')).toBe(false);
      // user-event treats everything in a disabled fieldset as disabled, so drive the DOM directly.
      link.focus();
      expect(document.activeElement).toBe(link);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(onLink).toHaveBeenCalledTimes(1);
      expect(click.defaultPrevented).toBe(false);
    });
  });
});
