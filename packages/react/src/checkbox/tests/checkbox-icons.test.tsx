// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { must } from '../../internal/tests/choice-fixtures';
import { drawnIconsIn, withPartIcons } from '../../internal/tests/part-icon-fixtures';
import { Checkbox } from '../index';
import { box, rootOf } from './fixtures';

afterEach(cleanup);

const background = (): HTMLElement => must(rootOf().querySelector<HTMLElement>('.cck-checkbox__background'));

describe('Checkbox theme part icon', () => {
  it('draws the theme tick in the background only while checked', async () => {
    render(withPartIcons(<Checkbox>Accept</Checkbox>));
    expect(drawnIconsIn(background())).toEqual([]);
    await userEvent.setup().click(box());
    expect(drawnIconsIn(background())).toEqual(['check']);
    await userEvent.setup().click(box());
    expect(drawnIconsIn(background())).toEqual([]);
  });

  it.each([
    ['unchecked', {}, []],
    ['checked', { defaultChecked: true }, ['check']],
    ['controlled checked', { checked: true, onCheckedChange: () => undefined }, ['check']],
    ['indeterminate', { indeterminate: true }, []],
    ['checked and indeterminate', { defaultChecked: true, indeterminate: true }, []],
  ] as const)('holds %s: %j', (_state, props, expected) => {
    render(withPartIcons(<Checkbox {...props}>Accept</Checkbox>));
    expect(drawnIconsIn(background())).toEqual(expected);
  });

  it('keeps the background aria-hidden and the dash state on the root', () => {
    render(withPartIcons(<Checkbox indeterminate>Accept</Checkbox>));
    expect(background().getAttribute('aria-hidden')).toBe('true');
    expect(rootOf().hasAttribute('data-indeterminate')).toBe(true);
  });

  it('follows a change of indeterminate', () => {
    const { rerender } = render(
      withPartIcons(
        <Checkbox defaultChecked indeterminate>
          Accept
        </Checkbox>,
      ),
    );
    expect(drawnIconsIn(background())).toEqual([]);
    act(() => {
      rerender(withPartIcons(<Checkbox defaultChecked>Accept</Checkbox>));
    });
    expect(drawnIconsIn(background())).toEqual(['check']);
  });

  it('draws the default tick without a theme, while checked', () => {
    render(<Checkbox defaultChecked>Accept</Checkbox>);
    expect(drawnIconsIn(background())).toEqual(['check']);
  });
});
