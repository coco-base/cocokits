import { StrictMode, type ReactElement } from 'react';
import { TabNav } from '../index';

/** Three links between two buttons of the page; `active` names the current one, `lockSettings` disables the last. */
export function Example({
  active = 'overview',
  lockSettings = false,
  label = 'Project',
}: {
  readonly active?: string;
  readonly lockSettings?: boolean;
  readonly label?: string;
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <TabNav.Root aria-label={label}>
        <TabNav.List>
          <TabNav.Link href="#overview" active={active === 'overview'}>
            Overview
          </TabNav.Link>
          <TabNav.Link href="#activity" active={active === 'activity'}>
            Activity
          </TabNav.Link>
          <TabNav.Link href="#settings" active={active === 'settings'} disabled={lockSettings}>
            Settings
          </TabNav.Link>
          <TabNav.Indicator />
        </TabNav.List>
      </TabNav.Root>
      <button>after</button>
    </StrictMode>
  );
}
