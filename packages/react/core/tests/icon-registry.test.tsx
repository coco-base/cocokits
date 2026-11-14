// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkIcon, heartIcon } from '@cocokits/icons';
import { defineThemeConfig } from '@cocokits/shared';
import { IconProvider, ThemeProvider, useIconRegistry, useThemeConfig } from '../src/index';

type Registry = ReturnType<typeof useIconRegistry>;

/** Hands the registry of the nearest provider to a test, after mount. */
function Grab({ onRegistry }: { readonly onRegistry: (registry: Registry) => void }): null {
  const registry = useIconRegistry();
  useEffect(() => {
    onRegistry(registry);
  }, [onRegistry, registry]);
  return null;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Probe({ name }: { readonly name: string }): React.ReactElement {
  const registry = useIconRegistry();
  return <i data-has={String(registry.has(name))} data-body={registry.get(name)?.body ?? ''} />;
}

describe('IconProvider and useIconRegistry', () => {
  it('has the base icons without a provider', () => {
    const html = renderToString(<Probe name="check" />);
    expect(html).toContain('data-has="true"');
    expect(html).toContain('data-body="');
    expect(renderToString(<Probe name="heart" />)).toContain('data-has="false"');
  });

  it('refuses a register call without a provider, logs an error and registers nothing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let registry: Registry | undefined;
    render(<Grab onRegistry={(value) => (registry = value)} />);
    registry?.registerIcons({ heart: heartIcon });
    registry?.registerIcon('late', () => Promise.resolve(heartIcon));
    expect(error).toHaveBeenCalledTimes(2);
    expect(String(error.mock.calls[0]?.[0])).toMatch(/^CocoKits: /);
    expect(registry?.has('heart')).toBe(false);
    expect(registry?.has('late')).toBe(false);
  });

  it('registers icons and lazy icons at creation, so the server render has them', () => {
    const html = renderToString(
      <IconProvider icons={{ heart: heartIcon }} lazyIcons={{ later: () => Promise.resolve(checkIcon) }}>
        <Probe name="heart" />
        <Probe name="later" />
      </IconProvider>,
    );
    expect(html).toContain('data-has="true"');
    expect(html.match(/data-has="true"/g)).toHaveLength(2);
    expect(html).toContain('data-body="&lt;path');
  });

  it('keeps one registry per mounted tree, in StrictMode too', () => {
    const onRegistry = vi.fn<(registry: Registry) => void>();
    const { rerender } = render(
      <StrictMode>
        <IconProvider>
          <Grab onRegistry={onRegistry} />
        </IconProvider>
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <IconProvider icons={{ x: heartIcon }}>
          <Grab onRegistry={onRegistry} />
        </IconProvider>
      </StrictMode>,
    );
    expect(new Set(onRegistry.mock.calls.map(([value]) => value)).size).toBe(1);
  });

  it('keeps a registry alive through the StrictMode cleanup and ends it on unmount', async () => {
    let registry: Registry | undefined;
    const listener = vi.fn();
    const { unmount } = render(
      <StrictMode>
        <IconProvider>
          <Grab onRegistry={(value) => (registry = value)} />
        </IconProvider>
      </StrictMode>,
    );
    registry?.subscribe(listener);
    await Promise.resolve();
    act(() => registry?.registerIcons({ a: heartIcon }));
    expect(listener).toHaveBeenCalledTimes(1);
    unmount();
    await Promise.resolve();
    registry?.registerIcons({ b: heartIcon });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('falls back from a nested provider to the outer one', () => {
    const html = renderToString(
      <IconProvider icons={{ outer: heartIcon }}>
        <IconProvider icons={{ inner: checkIcon }}>
          <Probe name="outer" />
          <Probe name="inner" />
        </IconProvider>
        <Probe name="inner" />
      </IconProvider>,
    );
    expect(html.match(/data-has="true"/g)).toHaveLength(2);
    expect(html.match(/data-has="false"/g)).toHaveLength(1);
  });
});

describe('useThemeConfig', () => {
  const themeConfig = defineThemeConfig({ name: 'test', components: {} });

  function Name(): React.ReactElement {
    return <i data-name={useThemeConfig()?.name ?? 'none'} />;
  }

  it('returns undefined without a provider and the config with one', () => {
    expect(renderToString(<Name />)).toContain('data-name="none"');
    expect(
      renderToString(
        <ThemeProvider themeConfig={themeConfig}>
          <Name />
        </ThemeProvider>,
      ),
    ).toContain('data-name="test"');
  });
});
