// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { avatarMeta } from '@cocokits/machines/avatar';
import { Avatar, type AvatarImageLoadingStatus } from '../index';
import { Example, FakeImage } from './fixtures';

beforeEach(() => {
  FakeImage.instances = [];
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const image = (container: HTMLElement): HTMLImageElement => {
  const element = container.querySelector('img.cck-avatar__image');
  if (!(element instanceof HTMLImageElement)) throw new Error('no image');
  return element;
};
const fallback = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('span.cck-avatar__fallback');
  if (!element) throw new Error('no fallback');
  return element;
};

describe('Avatar parts', () => {
  it('renders the root span, the img and the fallback span with their classes and no data-*', () => {
    const { container } = render(<Example />);
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('SPAN');
    expect(root?.className).toBe('cck-avatar');
    expect(image(container).getAttribute('alt')).toBe('Ada Park');
    expect(fallback(container).textContent).toBe('AP');
    const attrs = [...container.querySelectorAll('*')].flatMap((element) => element.getAttributeNames());
    const emitted = attrs.filter((name) => name.startsWith('data-'));
    expect(emitted.every((name) => Object.values(avatarMeta.dataAttrs).flat().includes(name))).toBe(true);
  });

  it('hides the image and shows the fallback until the picture loads, then the other way round', () => {
    const { container } = render(<Example />);
    expect(image(container).hidden).toBe(true);
    expect(fallback(container).hidden).toBe(false);
    act(() => {
      FakeImage.last.finish('load');
    });
    expect(image(container).hidden).toBe(false);
    expect(fallback(container).hidden).toBe(true);
  });

  it('keeps the fallback for a source that fails, and for no source', () => {
    const { container, rerender } = render(<Example />);
    act(() => {
      FakeImage.last.finish('error');
    });
    expect(image(container).hidden).toBe(true);
    expect(fallback(container).hidden).toBe(false);
    rerender(<Example src="" />);
    expect(image(container).hidden).toBe(true);
    expect(fallback(container).hidden).toBe(false);
  });

  it('copies crossOrigin and referrerPolicy to the probe and the img, and passes native attributes', () => {
    const { container } = render(
      <Example image={{ crossOrigin: 'anonymous', referrerPolicy: 'no-referrer', id: 'pic', className: 'mine' }} />,
    );
    expect(FakeImage.last.crossOrigin).toBe('anonymous');
    expect(FakeImage.last.referrerPolicy).toBe('no-referrer');
    expect(image(container).getAttribute('crossorigin')).toBe('anonymous');
    expect(image(container).id).toBe('pic');
    expect(image(container).className).toBe('cck-avatar__image mine');
  });

  it('keeps hidden when the consumer asks for hidden={false}', () => {
    const { container } = render(<Example image={{ hidden: false }} fallback={{ hidden: false }} />);
    expect(image(container).hidden).toBe(true);
    act(() => {
      FakeImage.last.finish('load');
    });
    expect(fallback(container).hidden).toBe(true);
  });
});

describe('Avatar loading status callback', () => {
  const sequence = (): {
    seen: AvatarImageLoadingStatus[];
    onLoadingStatusChange: (s: AvatarImageLoadingStatus) => void;
  } => {
    const seen: AvatarImageLoadingStatus[] = [];
    return { seen, onLoadingStatusChange: (status) => seen.push(status) };
  };

  it('reports loading then loaded, never idle and never twice in a row', () => {
    const { seen, onLoadingStatusChange } = sequence();
    render(<Example image={{ onLoadingStatusChange }} />);
    expect(seen).toEqual(['loading']);
    act(() => {
      FakeImage.last.finish('load');
    });
    expect(seen).toEqual(['loading', 'loaded']);
  });

  it('reports loading then error for a failing source', () => {
    const { seen, onLoadingStatusChange } = sequence();
    render(<Example image={{ onLoadingStatusChange }} />);
    act(() => {
      FakeImage.last.finish('error');
    });
    expect(seen).toEqual(['loading', 'error']);
  });

  it('starts a new sequence after a src change, with no idle between', () => {
    const { seen, onLoadingStatusChange } = sequence();
    const { container, rerender } = render(<Example image={{ onLoadingStatusChange }} />);
    act(() => {
      FakeImage.last.finish('load');
    });
    rerender(<Example src="/bob.webp" image={{ onLoadingStatusChange }} />);
    expect(image(container).hidden).toBe(true);
    expect(FakeImage.last.src).toBe('/bob.webp');
    act(() => {
      FakeImage.last.finish('load');
    });
    expect(seen).toEqual(['loading', 'loaded', 'loading', 'loaded']);
  });

  it('reports an already complete image as loaded at once', () => {
    class CompleteImage extends FakeImage {
      override complete = true;
      override naturalWidth = 40;
    }
    vi.stubGlobal('Image', CompleteImage);
    const { seen, onLoadingStatusChange } = sequence();
    const { container } = render(<Example image={{ onLoadingStatusChange }} />);
    expect(seen).toEqual(['loaded']);
    expect(image(container).hidden).toBe(false);
  });

  it('reports error for a missing source', () => {
    const { seen, onLoadingStatusChange } = sequence();
    render(<Example src="" image={{ onLoadingStatusChange }} />);
    expect(seen).toEqual(['error']);
  });

  it('does not pass an empty src to the img, so React logs no error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(<Example src="" />);
    expect(image(container).hasAttribute('src')).toBe(false);
    expect(error).not.toHaveBeenCalled();
  });
});

describe('Avatar fallback delay', () => {
  it('is hidden on the first render and shows after the delay', () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<Example delayMs={500} />);
    expect(fallback(container).hidden).toBe(true);
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(fallback(container).hidden).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(fallback(container).hidden).toBe(false);
    rerender(<Example delayMs={900} />);
    expect(fallback(container).hidden).toBe(true);
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(fallback(container).hidden).toBe(false);
  });

  it('shows at once without a delay', () => {
    const { container } = render(<Example />);
    expect(fallback(container).hidden).toBe(false);
  });
});

describe('Avatar development warning', () => {
  it('logs one CocoKits warning for a second Image in a Root', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Avatar.Root>
        <Avatar.Image src="/a.webp" alt="" />
        <Avatar.Image src="/b.webp" alt="" />
        <Avatar.Fallback>AP</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/^CocoKits: an Avatar has more than one/);
  });

  it('does not warn for one Image', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Example />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('throws for a part outside a Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Avatar.Image src="/a.webp" alt="" />)).toThrow(
      '<Avatar.Image> must be placed within <Avatar.Root>',
    );
    expect(() => render(<Avatar.Fallback>AP</Avatar.Fallback>)).toThrow(
      '<Avatar.Fallback> must be placed within <Avatar.Root>',
    );
  });
});

describe('Avatar root and fallback props', () => {
  it('merges className, passes role and aria-label, and reaches the elements with ref', () => {
    const rootRef = createRef<HTMLSpanElement>();
    const fallbackRef = createRef<HTMLSpanElement>();
    const imageRef = createRef<HTMLImageElement>();
    const { container } = render(
      <Avatar.Root ref={rootRef} className="mine" role="img" aria-label="Ada Park" id="root">
        <Avatar.Image ref={imageRef} src="/a.webp" alt="" />
        <Avatar.Fallback ref={fallbackRef} className="extra">
          AP
        </Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(rootRef.current).toBe(container.firstElementChild);
    expect(rootRef.current?.className).toBe('cck-avatar mine');
    expect(rootRef.current?.getAttribute('role')).toBe('img');
    expect(fallbackRef.current?.className).toBe('cck-avatar__fallback extra');
    expect(imageRef.current).toBe(image(container));
  });

  it('supports both render forms on the root and the fallback, and the status in the state', () => {
    const rootRef = createRef<HTMLElement>();
    const { container } = render(
      <Avatar.Root ref={rootRef} render={(props, state) => <div {...props} data-seen={state.status} />}>
        <Avatar.Fallback render={<strong data-own="" />}>AP</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(rootRef.current?.tagName).toBe('DIV');
    expect(rootRef.current?.className).toBe('cck-avatar');
    expect(rootRef.current?.getAttribute('data-seen')).toBe('idle');
    const strong = container.querySelector('strong');
    expect(strong?.className).toBe('cck-avatar__fallback');
    expect(strong?.hasAttribute('data-own')).toBe(true);
  });

  it('keeps the fallback hidden even when render is given', () => {
    const { container } = render(
      <Avatar.Root>
        <Avatar.Fallback delayMs={1000} render={<b hidden={false} />}>
          AP
        </Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(container.querySelector('b')?.hidden).toBe(true);
  });
});

describe('Avatar accessibility (axe)', () => {
  it('has no violations for an image with alt', async () => {
    const { container } = render(<Example />);
    act(() => {
      FakeImage.last.finish('load');
    });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations for initials named on the root', async () => {
    const { container } = render(<Example role="img" aria-label="Ada Park" src="" image={{ alt: '' }} />);
    expect(screen.getByRole('img', { name: 'Ada Park' })).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations for an avatar hidden from readers beside a printed name', async () => {
    const { container } = render(
      <div>
        <Example aria-hidden="true" src="" image={{ alt: '' }} />
        <span>Ada Park</span>
      </div>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
