import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  click,
  clickOutside,
  defineScenario,
  expectAbsent,
  expectAttr,
  expectChecked,
  expectEvent,
  expectFocus,
  expectInert,
  expectText,
  expectValue,
  focus,
  hover,
  part,
  press,
  role,
  type as typeText,
  type ScenarioDef,
  type ScenarioMeta,
  type ScenarioStep,
  within,
} from '../src/index';

describe('the scenario steps', () => {
  it('build targets as plain data', () => {
    expect(part('trigger')).toEqual({ kind: 'part', partName: 'trigger', index: 0 });
    expect(part('trigger', -1)).toEqual({ kind: 'part', partName: 'trigger', index: -1 });
    expect(role('checkbox')).toEqual({ kind: 'role', role: 'checkbox' });
    expect(role('checkbox', { name: 'Select all' })).toEqual({ kind: 'role', role: 'checkbox', name: 'Select all' });
  });

  it('build every action and expectation as plain data that survives JSON', () => {
    const box = role('textbox', { name: 'Full name' });
    const steps: ScenarioStep[] = [
      focus(box),
      typeText(box, 'Ada'),
      click(box),
      press('Shift+Tab'),
      expectText(box, 'Ada'),
      expectAttr(box, 'aria-invalid', 'true'),
      expectValue(box, ''),
      expectChecked(box, 'mixed'),
      expectFocus(box),
      expectEvent('valueChange', { value: '', reason: 'form-reset' }),
      expectEvent('checkedChange'),
    ];
    expect(steps.map((step) => step.kind)).toEqual([
      'focus',
      'type',
      'click',
      'press',
      'expectText',
      'expectAttr',
      'expectValue',
      'expectChecked',
      'expectFocus',
      'expectEvent',
      'expectEvent',
    ]);
    expect(JSON.parse(JSON.stringify(steps))).toEqual(steps);
    expect(steps.at(-2)).toEqual({ kind: 'expectEvent', eventName: 'valueChange', value: '', reason: 'form-reset' });
    expect(steps.at(-1)).toEqual({ kind: 'expectEvent', eventName: 'checkedChange' });
  });

  it('build the overlay steps as plain data', () => {
    const trigger = part('trigger');
    expect([hover(trigger), clickOutside(), expectAbsent(part('content'))]).toEqual([
      { kind: 'hover', target: { kind: 'part', partName: 'trigger', index: 0 } },
      { kind: 'clickOutside' },
      { kind: 'expectAbsent', target: { kind: 'part', partName: 'content', index: 0 } },
    ]);
  });

  it('builds within as a target that nests, and expectInert as a step', () => {
    const close = role('button', { name: 'Close' });
    const inner = within(role('dialog', { name: 'Discard changes?' }), close);
    expect(inner).toEqual({
      kind: 'within',
      container: { kind: 'role', role: 'dialog', name: 'Discard changes?' },
      target: close,
    });
    expect(within(role('dialog'), within(part('body'), part('item', 1)))).toEqual({
      kind: 'within',
      container: { kind: 'role', role: 'dialog' },
      target: { kind: 'within', container: { kind: 'part', partName: 'body', index: 0 }, target: part('item', 1) },
    });
    expect([click(inner), expectInert(close)]).toEqual([
      { kind: 'click', target: inner },
      { kind: 'expectInert', target: close },
    ]);
    expect(JSON.parse(JSON.stringify(inner))).toEqual(inner);
  });

  it('accepts true, false and mixed for a checked expectation, and nothing else', () => {
    expectTypeOf(expectChecked).parameter(1).toEqualTypeOf<boolean | 'mixed'>();
  });
});

describe('defineScenario', () => {
  it('returns its argument, so the compiler reads the source and nothing runs at build', () => {
    const scenario: ScenarioDef = {
      component: 'radio',
      id: 'plan',
      storyId: 'plan',
      title: 'The arrow keys move the check',
      steps: [focus(role('radio', { name: 'Basic' })), press('ArrowDown')],
    };
    expect(defineScenario(scenario)).toBe(scenario);
  });

  it('is the scenario the stories target writes, plus the theme', () => {
    expectTypeOf<ScenarioMeta>().toExtend<ScenarioDef>();
    expectTypeOf<ScenarioMeta['theme']>().toEqualTypeOf<string>();
  });
});
