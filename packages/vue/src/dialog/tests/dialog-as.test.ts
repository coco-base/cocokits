// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogContent, DialogDescription, DialogRoot, DialogTitle, DialogTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const Section = defineComponent({
  inheritAttrs: false,
  setup:
    (_props, { attrs, slots }) =>
    () =>
      h('section', attrs, slots.default?.()),
});

describe('Dialog as', () => {
  it('renders the default element of every part', async () => {
    mountView(() => [
      h(DialogRoot, { open: true }, () => [
        h(DialogTrigger, null, () => 'Open'),
        h(DialogContent, null, () => [h(DialogTitle, null, () => 'Title'), h(DialogDescription, null, () => 'Text')]),
      ]),
    ]);
    await settle();
    expect(screen.getByText('Open').localName).toBe('button');
    expect(screen.getByText('Title').localName).toBe('h2');
    expect(screen.getByText('Text').localName).toBe('p');
    expect(document.querySelector('dialog')).not.toBeNull();
  });

  it('renders another tag or a component given to as, and keeps the ids and the labelling', async () => {
    mountView(() => [
      h(DialogRoot, { open: true }, () => [
        h(DialogTrigger, null, () => 'Open'),
        h(DialogContent, null, () => [
          h(DialogTitle, { as: 'h3' }, () => 'Title'),
          h(DialogDescription, { as: Section }, () => 'Text'),
        ]),
      ]),
    ]);
    await settle();
    const title = screen.getByText('Title');
    const description = screen.getByText('Text');
    expect(title.localName).toBe('h3');
    expect(description.localName).toBe('section');
    const dialog = document.querySelector('dialog');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog?.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('reads as at render time, so changing it at runtime works', async () => {
    const tag = ref<'h2' | 'h4'>('h2');
    mountView(() => [
      h(DialogRoot, { open: true }, () => [
        h(DialogTrigger, null, () => 'Open'),
        h(DialogContent, null, () => h(DialogTitle, { as: tag.value }, () => 'Title')),
      ]),
    ]);
    await settle();
    tag.value = 'h4';
    await settle();
    expect(screen.getByText('Title').localName).toBe('h4');
  });

  it('keeps the content a native dialog: it takes no as', async () => {
    mountView(() => [
      h(DialogRoot, { open: true }, () => [
        h(DialogTrigger, null, () => 'Open'),
        h(DialogContent, { as: 'div', 'aria-label': 'Panel' } as Record<string, unknown>, () => 'Body'),
      ]),
    ]);
    await settle();
    expect(screen.getByLabelText('Panel').localName).toBe('dialog');
  });
});
