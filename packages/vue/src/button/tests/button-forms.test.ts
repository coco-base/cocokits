// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../index';
import { mountView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
    mountView(() => [h('form', { id: 'f', onSubmit: handler }), h(Button, { type: 'submit', form: 'f' }, () => 'Go')]);
    await userEvent.setup().click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sends the submitter name and value', async () => {
    const handler = onSubmit();
    mountView(() =>
      h('form', { onSubmit: handler }, [
        h(Button, { type: 'submit', name: 'action', value: 'save' }, () => 'Save'),
        h(Button, { type: 'submit', name: 'action', value: 'draft' }, () => 'Draft'),
      ]),
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Draft' }));
    expect(submitted(handler).get('action')).toBe('draft');
  });

  it('keeps the form* overrides on the element', async () => {
    const handler = onSubmit();
    mountView(() =>
      h('form', { action: '/a', method: 'get', onSubmit: handler }, [
        h(
          Button,
          { type: 'submit', formaction: '/b', formmethod: 'post', formtarget: '_blank', formenctype: 'text/plain' },
          () => 'Go',
        ),
      ]),
    );
    const button = screen.getByRole<HTMLButtonElement>('button');
    expect(button.getAttribute('formaction')).toBe('/b');
    expect(button.getAttribute('formmethod')).toBe('post');
    expect(button.getAttribute('formtarget')).toBe('_blank');
    expect(button.getAttribute('formenctype')).toBe('text/plain');
    await userEvent.setup().click(button);
    expect((handler.mock.calls[0]?.[0] as SubmitEvent).submitter).toBe(button);
  });

  it('blocks submit on an invalid form and keeps formnovalidate', async () => {
    const handler = onSubmit();
    mountView(() =>
      h('form', { onSubmit: handler }, [
        h('input', { 'aria-label': 'Name', required: true }),
        h(Button, { type: 'submit' }, () => 'Go'),
        h(Button, { type: 'submit', formnovalidate: true }, () => 'Skip'),
      ]),
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Go' }));
    expect(handler).not.toHaveBeenCalled();
    // jsdom does not honour formnovalidate on click, so only the attribute is asserted.
    expect(screen.getByRole('button', { name: 'Skip' }).hasAttribute('formnovalidate')).toBe(true);
  });

  it('leaves a disabled submitter out of the submission and renders no hidden input', async () => {
    const handler = onSubmit();
    mountView(() =>
      h('form', { onSubmit: handler }, [
        h('input', { 'aria-label': 'Name', name: 'n', value: 'x' }),
        h(Button, { type: 'submit', name: 'action', value: 'save', disabled: true }, () => 'Save'),
      ]),
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
    const form = document.querySelector<HTMLFormElement>('form');
    if (!form) throw new Error('no form');
    expect(new FormData(form).has('action')).toBe(false);
    expect(form.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('adds no hidden input for an enabled submitter', async () => {
    const handler = onSubmit();
    mountView(() =>
      h('form', { onSubmit: handler }, [h(Button, { type: 'submit', name: 'action', value: 'save' }, () => 'Save')]),
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(document.querySelector('input[type="hidden"]')).toBeNull();
    expect(submitted(handler).get('action')).toBe('save');
  });

  describe('inside <fieldset disabled>', () => {
    const view = (onClick: () => void, onLink: () => void) => () => [
      h('input', { 'aria-label': 'before' }),
      h('fieldset', { disabled: true }, [
        h(Button, { onClick }, () => 'Go'),
        h(Button, { as: 'a', href: '#go', onClick: onLink }, () => 'Link'),
      ]),
      h('input', { 'aria-label': 'after' }),
    ];

    it('disables the button natively, without data-disabled', () => {
      mountView(view(vi.fn(), vi.fn()));
      const button = screen.getByRole('button');
      expect(button.matches(':disabled')).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.hasAttribute('data-disabled')).toBe(false);
    });

    it('is skipped by Tab and Shift+Tab and fires no click', async () => {
      const onClick = vi.fn();
      mountView(view(onClick, vi.fn()));
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

    it('does not disable a link: it stays focusable and activates', () => {
      const onLink = vi.fn();
      mountView(view(vi.fn(), onLink));
      const link = screen.getByRole('link');
      expect(link.hasAttribute('aria-disabled')).toBe(false);
      expect(link.hasAttribute('data-disabled')).toBe(false);
      link.focus();
      expect(document.activeElement).toBe(link);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(onLink).toHaveBeenCalledTimes(1);
      expect(click.defaultPrevented).toBe(false);
    });
  });

  it('follows a consumer type that changes after mount, and falls back to the default', async () => {
    const type = ref<string | undefined>('submit');
    render(
      defineComponent({
        setup: () => () => h(Button, { type: type.value }, () => 'Go'),
      }),
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
    type.value = 'reset';
    await nextTick();
    expect(button.getAttribute('type')).toBe('reset');
    type.value = undefined;
    await nextTick();
    expect(button.getAttribute('type')).toBe('button');
  });
});
