import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckAvatarLabelImports } from '../../avatar-label';
import { CckAvatarImports } from '../index';
import { installFakeImage, lastProbe } from './fake-image';

const imports = [...CckAvatarImports, ...CckAvatarLabelImports];

describe('Avatar accessibility (axe)', () => {
  beforeEach(installFakeImage);
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has no violations: an image with alt, loaded', async () => {
    const { container, fixture } = await render(
      `<cck-avatar><img cckAvatarImage src="a.png" alt="Ada Lovelace" /><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`,
      { imports },
    );
    await fixture.whenStable();
    lastProbe().load();
    await fixture.whenStable();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations: initials with role="img" and aria-label on the root', async () => {
    const { container } = await render(
      `<cck-avatar role="img" aria-label="Ada Lovelace"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`,
      { imports },
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations: a label with an aria-hidden avatar', async () => {
    const { container } = await render(
      `<cck-avatar-label name="Ada Lovelace" description="Mathematician">
         <cck-avatar aria-hidden="true"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
       </cck-avatar-label>`,
      { imports },
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
