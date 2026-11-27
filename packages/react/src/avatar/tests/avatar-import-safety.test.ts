// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/avatar entries import safety', () => {
  it('import in plain Node, without window or document, and export the parts', async () => {
    expect(typeof document).toBe('undefined');
    const avatar = await import('../index');
    expect(Object.keys(avatar).sort()).toEqual(['Avatar', 'AvatarFallback', 'AvatarImage', 'AvatarRoot']);
    expect(avatar.Avatar.Root).toBe(avatar.AvatarRoot);
    expect(avatar.Avatar.Image).toBe(avatar.AvatarImage);
    expect(avatar.Avatar.Fallback).toBe(avatar.AvatarFallback);
    expect([avatar.AvatarRoot, avatar.AvatarImage, avatar.AvatarFallback].map((part) => part.displayName)).toEqual([
      'Avatar.Root',
      'Avatar.Image',
      'Avatar.Fallback',
    ]);
    const group = await import('../../avatar-group');
    expect(group.AvatarGroup.displayName).toBe('AvatarGroup');
    const label = await import('../../avatar-label');
    expect(label.AvatarLabel.displayName).toBe('AvatarLabel');
    // The first dynamic import compiles the whole entry; under a parallel run it can pass the default timeout.
  }, 60_000);
});
