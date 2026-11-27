import { StrictMode, type ReactElement } from 'react';
import { TabNav } from '../index';

/**
 * Panel mode: three links and the panel they drive. `active` names the current link (none when it is not one of
 * them), `lockOverview` disables the first link, and the panel follows `hasActiveLink` the way a router would.
 */
export function PanelExample({
  active = 'activity',
  lockOverview = false,
  strict = true,
  panelFirst = false,
}: {
  readonly active?: string | null;
  readonly lockOverview?: boolean;
  readonly strict?: boolean;
  readonly panelFirst?: boolean;
}): ReactElement {
  const panel = (
    <TabNav.Panel id="routed" hasActiveLink={active !== null}>
      routed page
    </TabNav.Panel>
  );
  const nav = (
    <TabNav.Root aria-label="Project" tabPanel="routed">
      <TabNav.List>
        <TabNav.Link href="#overview" active={active === 'overview'} disabled={lockOverview}>
          Overview
        </TabNav.Link>
        <TabNav.Link href="#activity" active={active === 'activity'}>
          Activity
        </TabNav.Link>
        <TabNav.Link href="#settings" active={active === 'settings'}>
          Settings
        </TabNav.Link>
        <TabNav.Indicator />
      </TabNav.List>
    </TabNav.Root>
  );
  const page = (
    <>
      <button>before</button>
      {panelFirst ? panel : null}
      {nav}
      {panelFirst ? null : panel}
    </>
  );
  return strict ? <StrictMode>{page}</StrictMode> : page;
}
