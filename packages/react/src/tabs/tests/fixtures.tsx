import { screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { Tabs, type TabsRootProps } from '../index';

/** Three tabs, the second one optionally disabled, between two buttons of the page. */
export function Example({
  lockPassword = false,
  label = 'Account settings',
  ...root
}: TabsRootProps & { readonly lockPassword?: boolean; readonly label?: string }): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Tabs.Root {...root}>
        <Tabs.List aria-label={label}>
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Trigger value="password" disabled={lockPassword}>
            Password
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="account">Account panel</Tabs.Content>
        <Tabs.Content value="password">Password panel</Tabs.Content>
        <Tabs.Content value="notifications">Notifications panel</Tabs.Content>
      </Tabs.Root>
      <button>after</button>
    </StrictMode>
  );
}

/** The tab with the accessible name. */
export const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });

/** The panel the tab points at with `aria-controls`. */
export const panelOf = (name: string): HTMLElement => {
  const element = document.getElementById(tab(name).getAttribute('aria-controls') ?? '');
  if (!element) throw new Error(`no panel for ${name}`);
  return element;
};

/** The text of the tabs that are selected. */
export const selectedTabs = (): string[] =>
  screen
    .getAllByRole('tab')
    .flatMap((element) => (element.getAttribute('aria-selected') === 'true' ? [element.textContent] : []));
