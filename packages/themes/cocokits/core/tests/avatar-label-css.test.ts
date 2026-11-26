import { describe, expect, it } from 'vitest';
import { declarationsOf, read } from './css-test-helpers';

const css = read('dist', 'components', 'avatar-label.css');

describe('avatar label in another control', () => {
  it('aligns its text to the start, so a centred host such as a Tabs trigger does not centre the lines', () => {
    expect(declarationsOf(css, '.cck-avatar-label')).toContain('text-align: start');
  });

  it.each([
    ['right', 'end'],
    ['top', 'center'],
    ['bottom', 'center'],
  ])('keeps the %s position aligned to the %s', (position, align) => {
    expect(declarationsOf(css, `.cck-avatar-label[data-avatar-position=${position}]`)).toContain(
      `text-align: ${align}`,
    );
  });

  it('sits in the middle of the line, so a Radio or Checkbox label is as high with a photo as with initials', () => {
    expect(declarationsOf(css, '.cck-avatar-label')).toContain('vertical-align: middle');
  });
});
