// @vitest-environment jsdom
import { createSSRApp, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { view } from '../../internal/tests/mount-helpers';
import { emailField } from './fixtures';

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
      emailField('email'),
      h(
        FormField,
        { id: 'other', required: true },
        { label: () => h(Label, null, () => 'Name'), default: () => h(Input, { modelValue: 'x' }) },
      ),
      emailField(),
    ]),
  );
}

const idRefs = (container: Element): string[] =>
  [...container.querySelectorAll('[id], [for]')].map((el) => `${el.id}|${String(el.getAttribute('for'))}`);

describe('Input hydration', () => {
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

  it('shows the facts known only to the Input after hydration, and keeps the server facts', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const fields = (): Element[] => [...container.querySelectorAll('.cck-form-field')];
    const second = (): Element => fields()[1];
    expect(second().hasAttribute('data-required')).toBe(true);
    expect(second().hasAttribute('data-filled')).toBe(false);

    app = makeApp();
    app.mount(container);
    await nextTick();

    expect(second().hasAttribute('data-required')).toBe(true);
    expect(second().hasAttribute('data-filled')).toBe(true);
    expect(container.querySelectorAll('.cck-label')[1].querySelector('.cck-label__required-marker')).not.toBeNull();
  });
});
