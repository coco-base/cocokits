// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { Radio } from '../../radio';
import { selectRoot, stubOverlayBrowser } from '../../select/tests/fixtures';
import { Switch } from '../../switch';
import { TabNavLink, TabNavList, TabNavRoot } from '../../tab-nav';
import { Textarea } from '../../textarea';
import { mountView } from './mount-helpers';
import { nextFrame } from './choice-helpers';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const spyWarn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);
const warnings = (spy: ReturnType<typeof spyWarn>): string[] => spy.mock.calls.map(([text]) => String(text));

const choiceWarning = (name: string): string =>
  `CocoKits: a ${name} has no accessible name. Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.`;
const textFixOutside =
  'Add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.';
const textFixInField =
  'Add a Label with text to the FormField, or an aria-label, a title, or an aria-labelledby that points to an element with text.';
const selectWarning =
  'CocoKits: a Select in a FormField has no accessible name. Add a Label with text to its FormField, or an aria-label, or an aria-labelledby that points to an element with text, to the SelectTrigger.';
const selectOutsideWarning =
  'CocoKits: a Select has no accessible name. Add a Label with text to its FormField, or an aria-label, or an aria-labelledby that points to an element with text, to the SelectTrigger.';
const tabNavWarning =
  'CocoKits: <TabNavRoot> has no accessible name. Add an aria-label, or an aria-labelledby that points to an element with text.';

const hiddenDiv = (child: () => VNode | VNode[]): VNode => h('div', { hidden: true }, child());
const closedDetails = (child: () => VNode | VNode[]): VNode =>
  h('details', null, [h('summary', 'More'), child()].flat());

const choices: readonly [string, Component, Record<string, unknown>][] = [
  ['Checkbox', Checkbox, {}],
  ['Switch', Switch, {}],
  ['Radio', Radio, { name: 'plan', value: 'free' }],
];

describe.each(choices)('%s name check', (name, Control, base) => {
  const control = (props: Record<string, unknown> = {}, slot?: () => unknown): VNode =>
    h(Control, { ...base, ...props }, slot);

  it('warns with its text when nothing names it', async () => {
    const spy = spyWarn();
    mountView(() => control());
    await nextFrame();
    expect(warnings(spy)).toEqual([choiceWarning(name)]);
  });

  it.each<[string, () => VNode[] | VNode]>([
    ['a dangling aria-labelledby', () => control({ 'aria-labelledby': 'nowhere' })],
    ['an empty aria-label', () => control({ 'aria-label': '' })],
    ['a caption of only an aria-hidden icon', () => control({}, () => h('svg', { 'aria-hidden': 'true' }))],
    ['a caption of only an empty span', () => control({}, () => h('span'))],
  ])('warns with %s', async (_label, ui) => {
    const spy = spyWarn();
    mountView(ui);
    await nextFrame();
    expect(warnings(spy)).toEqual([choiceWarning(name)]);
  });

  it.each<[string, () => VNode[] | VNode]>([
    ['a caption', () => control({}, () => 'Caption')],
    ['an aria-label', () => control({ 'aria-label': 'Name' })],
    ['a caption inside <div hidden>', () => hiddenDiv(() => control({}, () => 'Caption'))],
    ['a caption inside a closed <details>', () => closedDetails(() => control({}, () => 'Caption'))],
  ])('does not warn with %s', async (_label, ui) => {
    const spy = spyWarn();
    mountView(ui);
    await nextFrame();
    expect(warnings(spy)).toEqual([]);
  });
});

describe.each<[string, Component, string]>([
  ['Input', Input, 'an Input'],
  ['Textarea', Textarea, 'a Textarea'],
])('%s name check', (_name, Control, noun) => {
  it('warns outside a FormField with its text', async () => {
    const spy = spyWarn();
    mountView(() => h(Control));
    await nextFrame();
    expect(warnings(spy)).toEqual([`CocoKits: ${noun} has no accessible name. ${textFixOutside}`]);
  });

  it.each<[string, () => VNode[] | VNode]>([
    ['an aria-label', () => h(Control, { 'aria-label': 'Name' })],
    ['a placeholder', () => h(Control, { placeholder: 'Name' })],
    ['a label for', () => [h('label', { for: 'n' }, 'Name'), h(Control, { id: 'n' })]],
  ])('does not warn outside a FormField with %s', async (_label, ui) => {
    const spy = spyWarn();
    mountView(ui);
    await nextFrame();
    expect(warnings(spy)).toEqual([]);
  });

  it.each<[string, () => VNode[] | VNode]>([
    ['a dangling aria-labelledby', () => h(Control, { 'aria-labelledby': 'nowhere' })],
    ['an empty aria-label', () => h(Control, { 'aria-label': '' })],
  ])('warns outside a FormField with %s', async (_label, ui) => {
    const spy = spyWarn();
    mountView(ui);
    await nextFrame();
    expect(warnings(spy)).toEqual([`CocoKits: ${noun} has no accessible name. ${textFixOutside}`]);
  });

  it('warns in a FormField with an empty Label, with its text', async () => {
    const spy = spyWarn();
    mountView(() => h(FormField, null, { label: () => h(Label), default: () => h(Control) }));
    await nextFrame();
    expect(warnings(spy)).toEqual([`CocoKits: ${noun} in a FormField has no accessible name. ${textFixInField}`]);
  });

  it('does not warn in a FormField with a Label, also inside <div hidden> or a closed <details>', async () => {
    const spy = spyWarn();
    const field = (): VNode =>
      h(FormField, null, { label: () => h(Label, null, () => 'Name'), default: () => h(Control) });
    mountView(() => [hiddenDiv(field), closedDetails(field)]);
    await nextFrame();
    expect(warnings(spy)).toEqual([]);
  });
});

describe('Select name check', () => {
  const inField = (labelText?: string): VNode =>
    h(FormField, null, {
      label: () => h(Label, null, () => labelText),
      default: () => selectRoot({}, { unnamed: true }),
    });

  it('warns with an empty Label of its FormField', async () => {
    const spy = spyWarn();
    mountView(() => inField());
    await nextFrame();
    expect(warnings(spy)).toEqual([selectWarning]);
  });

  it.each<[string, Record<string, unknown>]>([
    ['a dangling aria-labelledby', { 'aria-labelledby': 'nowhere' }],
    ['an empty aria-label', { 'aria-label': '' }],
  ])('warns with %s on the trigger', async (_name, trigger) => {
    const spy = spyWarn();
    mountView(() => selectRoot({}, { trigger }));
    await nextFrame();
    expect(warnings(spy)).toEqual([selectOutsideWarning]);
  });

  it('does not warn with a Label with text, also inside <div hidden> or a closed <details>', async () => {
    const spy = spyWarn();
    mountView(() => [hiddenDiv(() => inField('Dish')), closedDetails(() => inField('Dish'))]);
    await nextFrame();
    expect(warnings(spy)).toEqual([]);
  });
});

describe('TabNav name check', () => {
  const nav = (props: Record<string, unknown>): VNode =>
    h(TabNavRoot, props, () => h(TabNavList, null, () => h(TabNavLink, { href: '#a' }, () => 'A')));

  it.each<[string, Record<string, unknown>]>([
    ['a dangling aria-labelledby', { 'aria-labelledby': 'nowhere' }],
    ['an empty aria-label', { 'aria-label': '' }],
  ])('warns with %s', (_name, props) => {
    const spy = spyWarn();
    mountView(() => nav(props));
    expect(warnings(spy)).toEqual([tabNavWarning]);
  });

  it('does not warn with an aria-labelledby inside <div hidden> or a closed <details>', () => {
    const spy = spyWarn();
    const named = (): VNode[] => [h('span', { id: 'title' }, 'Account'), nav({ 'aria-labelledby': 'title' })];
    mountView(() => [hiddenDiv(named), closedDetails(named)]);
    expect(warnings(spy)).toEqual([]);
  });
});
