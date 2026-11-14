// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/dialog import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'Dialog',
      'DialogClose',
      'DialogContent',
      'DialogDescription',
      'DialogRoot',
      'DialogTitle',
      'DialogTrigger',
    ]);
    expect(entry.Dialog.Root).toBe(entry.DialogRoot);
    expect(entry.Dialog.Trigger).toBe(entry.DialogTrigger);
    expect(entry.Dialog.Content).toBe(entry.DialogContent);
    expect(entry.Dialog.Title).toBe(entry.DialogTitle);
    expect(entry.Dialog.Description).toBe(entry.DialogDescription);
    expect(entry.Dialog.Close).toBe(entry.DialogClose);
    expect(
      [
        entry.DialogRoot,
        entry.DialogTrigger,
        entry.DialogContent,
        entry.DialogTitle,
        entry.DialogDescription,
        entry.DialogClose,
      ].map((part) => part.displayName),
    ).toEqual([
      'Dialog.Root',
      'Dialog.Trigger',
      'Dialog.Content',
      'Dialog.Title',
      'Dialog.Description',
      'Dialog.Close',
    ]);
  });
});
