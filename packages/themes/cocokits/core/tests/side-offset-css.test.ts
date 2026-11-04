import { describe, expect, it } from 'vitest';
import { read } from './css-test-helpers';

const rule = /@property --side-offset \{\s*syntax: "<length>";\s*inherits: true;\s*initial-value: 0px;\s*\}/g;
const sheets = ['components/popover.css', 'components/select.css', 'components/tooltip.css', 'styles.css'];

describe('--side-offset registration', () => {
  it.each(sheets)('%s registers it once, as an inheriting <length> with an initial 0px', (sheet) => {
    const css = read('dist', ...sheet.split('/'));
    expect(css.match(rule)).toHaveLength(1);
    expect(css.match(/@property --side-offset/g)).toHaveLength(1);
  });

  it.each(sheets)('%s keeps the rule at the top level, outside any block', (sheet) => {
    const css = read('dist', ...sheet.split('/'));
    expect(css).toMatch(/(^|\n\}\n)@property --side-offset \{/);
  });
});
