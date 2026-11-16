// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it } from 'vitest';
import { groupView, mountView, type GroupViewOptions } from './fixtures';

afterEach(cleanup);

/** One row: the props of the group, and whether the invalid state shows (radio-10). */
interface Row {
  readonly name: string;
  readonly group: Record<string, unknown>;
  readonly invalid: boolean;
}

const ROWS: readonly Row[] = [
  { name: 'required, touched, no value', group: { required: true, touched: true }, invalid: true },
  {
    name: 'required, touched, an empty value',
    group: { required: true, touched: true, modelValue: '' },
    invalid: true,
  },
  { name: 'required, touched, a value', group: { required: true, touched: true, defaultValue: 'pro' }, invalid: false },
  { name: 'required, not touched, no value', group: { required: true }, invalid: false },
  { name: 'touched, not required, no value', group: { touched: true }, invalid: false },
  { name: 'nothing set', group: {}, invalid: false },
];

const root = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>('.cck-radio-group');
  if (!element) throw new Error('No radio group rendered.');
  return element;
};

describe('RadioGroup touched (radio-10)', () => {
  it.each(ROWS)('$name: invalid is $invalid in the browser', ({ group, invalid }) => {
    mountView(groupView({ group }));
    expect(root().getAttribute('aria-invalid')).toBe(invalid ? 'true' : null);
    expect(root().hasAttribute('data-invalid')).toBe(invalid);
  });

  it.each(ROWS)('$name: invalid is $invalid on the server', async ({ group, invalid }) => {
    const options: GroupViewOptions = { group };
    const html = await renderToString(createSSRApp({ render: groupView(options) }));
    const tag = /<div\b[^>]*role="radiogroup"[^>]*>/.exec(html)?.[0] ?? '';
    expect(tag.includes('aria-invalid="true"')).toBe(invalid);
    expect(/\sdata-invalid(?=[\s>=])/.test(tag)).toBe(invalid);
  });
});
