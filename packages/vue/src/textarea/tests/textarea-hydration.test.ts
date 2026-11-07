// @vitest-environment jsdom
import { createSSRApp, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Textarea } from '../index';
import { view } from '../../internal/tests/mount-helpers';
import { messageField } from './fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function makeApp(): App {
  return createSSRApp(
    view(() => [
      messageField('msg'),
      h(
        FormField,
        { id: 'other', required: true },
        {
          label: () => h(Label, null, () => 'Name'),
          error: () => h(FieldError, { 'data-testid': 'error' }, () => 'Required'),
          default: () => h(Textarea, { modelValue: 'x', invalid: true }),
        },
      ),
    ]),
  );
}

const idRefs = (container: Element): string[] =>
  [...container.querySelectorAll('[id], [for]')].map((el) => `${el.id}|${String(el.getAttribute('for'))}`);

describe('Textarea and the zones on hydration', () => {
  it('hydrates the server markup without a mismatch, a warning or a change of the ids', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const ids = idRefs(container);

    app = makeApp();
    app.mount(container);
    await nextTick();

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(idRefs(container)).toEqual(ids);
  });

  it('keeps an empty FieldError of an invalid untouched field empty after hydration', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());

    app = makeApp();
    app.mount(container);
    await nextTick();

    const error = container.querySelector('[data-testid="error"]');
    expect(error?.textContent).toBe('');
    expect(error?.getAttribute('aria-live')).toBe('polite');
  });

  it('shows the facts known only to the Textarea after hydration', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const second = (): Element => container.querySelectorAll('.cck-form-field')[1];
    expect(second().hasAttribute('data-filled')).toBe(false);

    app = makeApp();
    app.mount(container);
    await nextTick();

    expect(second().hasAttribute('data-filled')).toBe(true);
    expect(second().hasAttribute('data-required')).toBe(true);
  });
});
