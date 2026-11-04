import { describe, expect, it, vi } from 'vitest';
import { dialogAnatomy, dialogIds, dialogMeta, getDialogProps, transitionDialog, type DialogState } from '../index';

const closed: DialogState = { id: 'd1', open: false };
const open: DialogState = { id: 'd1', open: true };
const click = (): Event => new Event('click', { cancelable: true });

describe('classes', () => {
  it('renders the part classes', () => {
    const parts = getDialogProps(open, vi.fn());
    expect(dialogAnatomy.classes).toMatchObject({
      trigger: 'cck-dialog__trigger',
      content: 'cck-dialog__content',
      title: 'cck-dialog__title',
      description: 'cck-dialog__description',
      close: 'cck-dialog__close',
    });
    expect(parts.trigger.class).toBe('cck-dialog__trigger');
    expect(parts.content.class).toBe('cck-dialog__content');
    expect(parts.title.class).toBe('cck-dialog__title');
    expect(parts.description.class).toBe('cck-dialog__description');
    expect(parts.close.class).toBe('cck-dialog__close');
  });
});

describe('trigger ARIA', () => {
  it('renders aria-expanded always and aria-controls only while the content is mounted', () => {
    expect(getDialogProps(closed, vi.fn()).trigger['aria-expanded']).toBe('false');
    expect(getDialogProps(closed, vi.fn()).trigger['aria-controls']).toBeUndefined();
    expect(getDialogProps(open, vi.fn()).trigger['aria-expanded']).toBe('true');
    expect(getDialogProps(open, vi.fn()).trigger['aria-controls']).toBe(dialogIds('d1').content);
  });

  it('keeps aria-controls while an exit animation keeps the content mounted', () => {
    const exiting = getDialogProps({ ...closed, mounted: true }, vi.fn()).trigger;
    expect(exiting['aria-expanded']).toBe('false');
    expect(exiting['aria-controls']).toBe(dialogIds('d1').content);
    expect(exiting['data-state']).toBe('closed');
  });

  it('is a button that opens a dialog', () => {
    expect(getDialogProps(closed, vi.fn()).trigger).toMatchObject({ type: 'button', 'aria-haspopup': 'dialog' });
  });
});

describe('content', () => {
  it('has no role (the native dialog has it) and renders the state', () => {
    const content = getDialogProps(open, vi.fn()).content;
    expect(content).not.toHaveProperty('role');
    expect(content['data-state']).toBe('open');
    expect(content.id).toBe(dialogIds('d1').content);
  });

  it('is labelled by the title and described by the description only while they are mounted', () => {
    const ids = dialogIds('d1');
    const none = getDialogProps(open, vi.fn()).content;
    expect(none['aria-labelledby']).toBeUndefined();
    expect(none['aria-describedby']).toBeUndefined();
    const both = getDialogProps({ ...open, hasTitle: true, hasDescription: true }, vi.fn());
    expect(both.content['aria-labelledby']).toBe(ids.title);
    expect(both.content['aria-describedby']).toBe(ids.description);
    expect(both.title.id).toBe(ids.title);
    expect(both.description.id).toBe(ids.description);
  });

  it('takes the title id from titleId for both the Title and the content label', () => {
    const parts = getDialogProps({ ...open, hasTitle: true, titleId: 'my-title' }, vi.fn());
    expect(parts.title.id).toBe('my-title');
    expect(parts.content['aria-labelledby']).toBe('my-title');
    const unlabelled = getDialogProps({ ...open, titleId: 'my-title' }, vi.fn());
    expect(unlabelled.title.id).toBe('my-title');
    expect(unlabelled.content['aria-labelledby']).toBeUndefined();
  });

  it('renders exactly the attributes the meta declares', () => {
    const dataKeys = (props: object): string[] =>
      Object.entries(props)
        .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
        .map(([name]) => name);
    const parts = getDialogProps(open, vi.fn());
    expect(dataKeys(parts.trigger)).toEqual([...dialogMeta.dataAttrs.trigger]);
    expect(dataKeys(parts.content)).toEqual([...dialogMeta.dataAttrs.content]);
    expect(dataKeys(parts.title)).toEqual([...dialogMeta.dataAttrs.title]);
    expect(dataKeys(parts.description)).toEqual([...dialogMeta.dataAttrs.description]);
    expect(dataKeys(parts.close)).toEqual([...dialogMeta.dataAttrs.close]);
  });

  it('makes the Close part a non-submitting button', () => {
    expect(getDialogProps(open, vi.fn()).close.type).toBe('button');
  });
});

describe('handlers', () => {
  it('send the trigger and close clicks', () => {
    const send = vi.fn();
    const parts = getDialogProps(open, send);
    const event = click();
    parts.trigger.onClick(event);
    parts.close.onClick(event);
    expect(send).toHaveBeenNthCalledWith(1, { type: 'TRIGGER.CLICK', event });
    expect(send).toHaveBeenNthCalledWith(2, { type: 'CLOSE.CLICK', event });
  });

  it('send the native close event of the dialog', () => {
    const send = vi.fn();
    const event = new Event('close');
    getDialogProps(open, send).content.onClose(event);
    expect(send).toHaveBeenCalledWith({ type: 'CONTENT.CLOSE', event });
  });

  it('send nothing when a consumer handler vetoed the click', () => {
    const send = vi.fn();
    const event = click();
    event.preventDefault();
    getDialogProps(open, send).trigger.onClick(event);
    getDialogProps(open, send).close.onClick(event);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('transitionDialog', () => {
  const event = click();

  it('opens from the trigger', () => {
    expect(transitionDialog(closed, { type: 'TRIGGER.CLICK', event })).toEqual({ open: true, reason: 'trigger' });
  });

  it('closes from the Close part and from the platform close event with the reason close', () => {
    expect(transitionDialog(open, { type: 'CLOSE.CLICK', event })).toEqual({ open: false, reason: 'close' });
    expect(transitionDialog(open, { type: 'CONTENT.CLOSE', event })).toEqual({ open: false, reason: 'close' });
  });

  it('closes on the layer stack reasons escape and outside-press', () => {
    expect(transitionDialog(open, { type: 'CONTENT.DISMISS', reason: 'escape', event })).toEqual({
      open: false,
      reason: 'escape',
    });
    expect(transitionDialog(open, { type: 'CONTENT.DISMISS', reason: 'outside-press', event })).toEqual({
      open: false,
      reason: 'outside-press',
    });
  });

  it('reports nothing when the state would not change', () => {
    expect(transitionDialog(open, { type: 'TRIGGER.CLICK', event })).toBeNull();
    expect(transitionDialog(closed, { type: 'CLOSE.CLICK', event })).toBeNull();
    expect(transitionDialog(closed, { type: 'CONTENT.CLOSE', event })).toBeNull();
    expect(transitionDialog(closed, { type: 'CONTENT.DISMISS', reason: 'escape', event })).toBeNull();
  });
});

describe('meta', () => {
  it('links the APG pattern, the roles and the default elements', () => {
    expect(dialogMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/');
    expect(dialogMeta.roles.content).toBeNull();
    expect(dialogMeta.defaultElements).toMatchObject({ trigger: 'button', content: 'dialog', close: 'button' });
    expect(dialogMeta.defaultElements).not.toHaveProperty('root');
  });

  it('lists every keyboard row of the spec', () => {
    expect(dialogMeta.keyboard.map((row) => row.key)).toEqual(['Enter / Space', 'Tab / Shift+Tab', 'Escape']);
  });
});
