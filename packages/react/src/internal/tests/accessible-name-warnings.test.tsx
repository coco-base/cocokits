// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { Dialog } from '../../dialog';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { Popover } from '../../popover';
import { Radio } from '../../radio';
import { Dishes, Opt, stubTopLayer } from '../../select/tests/fixtures';
import { Switch } from '../../switch';
import { TabNav } from '../../tab-nav';
import { Textarea } from '../../textarea';
import { nextFrame } from './choice-fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Renders the UI, waits for the development check (a frame) and returns the name warnings it logged. */
async function nameWarnings(ui: ReactElement): Promise<string[]> {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(ui);
  await nextFrame();
  await nextFrame();
  const texts = warn.mock.calls.map(([text]) => String(text)).filter((text) => text.includes('has no accessible name'));
  cleanup();
  warn.mockRestore();
  return texts;
}

const DIALOG =
  'CocoKits: <Dialog.Content> has no accessible name. Add a <Dialog.Title> with text, or an aria-label, or an aria-labelledby that points to an element with text.';
const POPOVER =
  'CocoKits: <Popover.Content> has no accessible name. Add a <Popover.Title> with text, or an aria-label, or an aria-labelledby that points to an element with text.';
const SELECT =
  'CocoKits: a Select in a FormField has no accessible name. Add a Label with text to its FormField, or an aria-label, or an aria-labelledby that points to an element with text.';
const TAB_NAV =
  'CocoKits: <TabNav.Root> has no accessible name. Add an aria-label, or an aria-labelledby that points to an element with text.';
const FIELD_CONTROL = (article: string, name: string): string =>
  `CocoKits: ${article} ${name} in a FormField has no accessible name. Add a Label with text to the FormField, or an aria-label, a title, or an aria-labelledby that points to an element with text.`;
const FREE_CONTROL = (article: string, name: string): string =>
  `CocoKits: ${article} ${name} has no accessible name. Add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.`;
const CHOICE = (name: string): string =>
  `CocoKits: a ${name} has no accessible name. Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.`;

describe('Dialog and Popover content name', () => {
  it('warns for a dangling aria-labelledby and an empty Title', async () => {
    const dialog = (children: ReactElement | string, props: object = {}): ReactElement => (
      <Dialog.Root defaultOpen>
        <Dialog.Content {...props}>{children}</Dialog.Content>
      </Dialog.Root>
    );
    const popover = (children: ReactElement | string, props: object = {}): ReactElement => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content {...props}>{children}</Popover.Content>
      </Popover.Root>
    );
    expect(await nameWarnings(dialog('text', { 'aria-labelledby': 'nowhere' }))).toEqual([DIALOG]);
    expect(await nameWarnings(dialog(<Dialog.Title />))).toEqual([DIALOG]);
    expect(await nameWarnings(popover('text', { 'aria-labelledby': 'nowhere' }))).toEqual([POPOVER]);
    expect(await nameWarnings(popover(<Popover.Title />))).toEqual([POPOVER]);
  });
});

describe('Select name', () => {
  it('warns for a dangling aria-labelledby and an empty aria-label', async () => {
    const select = (props: object): ReactElement => (
      <FormField>
        <Dishes label={null} triggerProps={props}>
          <Opt value="Cake">Cake</Opt>
        </Dishes>
      </FormField>
    );
    expect(await nameWarnings(select({ 'aria-labelledby': 'nowhere' }))).toEqual([SELECT]);
    expect(await nameWarnings(select({ 'aria-label': '' }))).toEqual([SELECT]);
  });
});

describe('TabNav name', () => {
  it('warns for a dangling aria-labelledby and an empty aria-label', async () => {
    const nav = (props: object): ReactElement => (
      <TabNav.Root {...props}>
        <TabNav.List>
          <TabNav.Link href="#a">A</TabNav.Link>
        </TabNav.List>
      </TabNav.Root>
    );
    expect(await nameWarnings(nav({ 'aria-labelledby': 'nowhere' }))).toEqual([TAB_NAV]);
    expect(await nameWarnings(nav({ 'aria-label': '' }))).toEqual([TAB_NAV]);
  });
});

describe('Input and Textarea name in a FormField', () => {
  it('warns for a dangling aria-labelledby, an empty Label and an empty aria-label', async () => {
    const input = (
      <FormField>
        <Input aria-labelledby="nowhere" />
      </FormField>
    );
    const textarea = (
      <FormField label={<Label />}>
        <Textarea />
      </FormField>
    );
    const empty = (
      <FormField>
        <Input aria-label="" />
      </FormField>
    );
    expect(await nameWarnings(input)).toEqual([FIELD_CONTROL('an', 'Input')]);
    expect(await nameWarnings(textarea)).toEqual([FIELD_CONTROL('a', 'Textarea')]);
    expect(await nameWarnings(empty)).toEqual([FIELD_CONTROL('an', 'Input')]);
  });
});

describe('Input and Textarea name outside a FormField (AN8)', () => {
  it('warns with no name', async () => {
    expect(await nameWarnings(<Input />)).toEqual([FREE_CONTROL('an', 'Input')]);
    expect(await nameWarnings(<Textarea />)).toEqual([FREE_CONTROL('a', 'Textarea')]);
  });

  it('does not warn with an aria-label, a label for or a placeholder', async () => {
    const ui = (
      <>
        <Input aria-label="Name" />
        <Textarea aria-label="Note" />
        <label htmlFor="in">Email</label>
        <Input id="in" />
        <label htmlFor="ta">Message</label>
        <Textarea id="ta" />
        <Input placeholder="Search" />
        <Textarea placeholder="Notes" />
      </>
    );
    expect(await nameWarnings(ui)).toEqual([]);
  });
});

describe('Checkbox, Switch and Radio name', () => {
  it('warns for a dangling aria-labelledby, an empty aria-label, an aria-hidden icon and an empty span', async () => {
    const icon = <span aria-hidden="true">*</span>;
    expect(await nameWarnings(<Checkbox aria-labelledby="nowhere" />)).toEqual([CHOICE('Checkbox')]);
    expect(await nameWarnings(<Checkbox aria-label="" />)).toEqual([CHOICE('Checkbox')]);
    expect(await nameWarnings(<Checkbox>{icon}</Checkbox>)).toEqual([CHOICE('Checkbox')]);
    expect(await nameWarnings(<Checkbox>{<span />}</Checkbox>)).toEqual([CHOICE('Checkbox')]);
    expect(await nameWarnings(<Switch aria-labelledby="nowhere" />)).toEqual([CHOICE('Switch')]);
    expect(await nameWarnings(<Switch>{icon}</Switch>)).toEqual([CHOICE('Switch')]);
    expect(await nameWarnings(<Switch>{<span />}</Switch>)).toEqual([CHOICE('Switch')]);
  });

  it('warns for a Radio with no name, an aria-hidden icon or an empty span (AN9)', async () => {
    expect(await nameWarnings(<Radio name="g" value="a" />)).toEqual([CHOICE('Radio')]);
    expect(
      await nameWarnings(
        <Radio name="g" value="a">
          {<span aria-hidden="true">*</span>}
        </Radio>,
      ),
    ).toEqual([CHOICE('Radio')]);
    expect(
      await nameWarnings(
        <Radio name="g" value="a">
          {<span />}
        </Radio>,
      ),
    ).toEqual([CHOICE('Radio')]);
  });

  it('does not warn for a Radio with a caption or an aria-label (AN9)', async () => {
    const ui = (
      <>
        <Radio name="g" value="a">
          Free
        </Radio>
        <Radio name="g" value="b" aria-label="Pro" />
      </>
    );
    expect(await nameWarnings(ui)).toEqual([]);
  });
});

describe('Named when shown', () => {
  const named = (): ReactElement => (
    <>
      <FormField label={<Label>Name</Label>}>
        <Input />
      </FormField>
      <FormField label={<Label>Dish</Label>}>
        <Dishes label={null}>
          <Opt value="Cake">Cake</Opt>
        </Dishes>
      </FormField>
      <Checkbox>Caption</Checkbox>
      <Radio name="g" value="a">
        Caption
      </Radio>
      <span id="nav-name">Project</span>
      <TabNav.Root aria-labelledby="nav-name">
        <TabNav.List>
          <TabNav.Link href="#a">A</TabNav.Link>
        </TabNav.List>
      </TabNav.Root>
    </>
  );

  it('does not warn inside content that is hidden', async () => {
    expect(await nameWarnings(<div hidden>{named()}</div>)).toEqual([]);
  });

  it('does not warn inside a closed details', async () => {
    const ui = (
      <details>
        <summary>More</summary>
        {named()}
      </details>
    );
    expect(await nameWarnings(ui)).toEqual([]);
  });
});
