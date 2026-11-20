// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Checkbox, Radio, Switch } from '../src/index';
import { html } from './helpers';

describe('theme choice controls on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options and the checked mark of a Checkbox in the server HTML', () => {
    const markup = html(
      <Checkbox defaultChecked indeterminate size="lg" color="danger" labelPosition="before">
        Accept
      </Checkbox>,
    );
    const root = /<div[^>]*cck-checkbox[^>]*>/.exec(markup)?.[0] ?? '';
    for (const part of [
      'class="cck-checkbox"',
      'data-size="lg"',
      'data-cck-color="danger"',
      'data-label-position="before"',
      'data-checked=""',
      'data-indeterminate=""',
    ]) {
      expect(root).toContain(part);
    }
    expect(markup).toMatch(/<input[^>]*checked=""/);
  });

  it('renders the Switch role, the disabled fact and the defaults', () => {
    const markup = html(<Switch disabled>Alerts</Switch>);
    const root = /<div[^>]*cck-switch[^>]*>/.exec(markup)?.[0] ?? '';
    expect(root).toContain('data-size="md"');
    expect(root).toContain('data-cck-color="brand"');
    expect(root).toContain('data-label-position="after"');
    expect(root).toContain('data-disabled=""');
    expect(markup).toContain('role="switch"');
  });

  it('renders same-name Radios with the checked one marked', () => {
    const markup = html(
      <fieldset>
        <Radio name="plan" value="a" checked>
          A
        </Radio>
        <Radio name="plan" value="b" checked={false}>
          B
        </Radio>
      </fieldset>,
    );
    expect(markup.match(/class="cck-radio"/g)).toHaveLength(2);
    expect(markup.match(/data-checked=""/g)).toHaveLength(1);
    expect(markup.match(/data-size="md"/g)).toHaveLength(2);
  });
});
