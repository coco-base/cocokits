// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from '../index';
import { panelOf, selectedTabs, tab } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Tabs trigger changes', () => {
  function Lockable(): ReactElement {
    const [locked, setLocked] = useState(false);
    return (
      <>
        <button
          onClick={() => {
            setLocked(true);
          }}
        >
          lock
        </button>
        <Tabs.Trigger value="password" disabled={locked}>
          Password
        </Tabs.Trigger>
      </>
    );
  }

  it('reaches the Root when only the trigger renders: the arrows skip a tab that became disabled', async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="account">
        <Tabs.List aria-label="Tabs">
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Lockable />
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'lock' }));
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });
});

describe('Tabs trigger value change', () => {
  function Renamable(): ReactElement {
    const [value, setValue] = useState('password');
    return (
      <>
        <button
          onClick={() => {
            setValue('security');
          }}
        >
          rename
        </button>
        <Tabs.Trigger value={value}>Password</Tabs.Trigger>
      </>
    );
  }

  it('reaches the Root when only the trigger renders: keys select the new value and the panel follows', async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="account">
        <Tabs.List aria-label="Tabs">
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Renamable />
        </Tabs.List>
        <Tabs.Content value="account">Account panel</Tabs.Content>
        <Tabs.Content value="security">Security panel</Tabs.Content>
      </Tabs.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'rename' }));
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(selectedTabs()).toEqual(['Password']);
    expect(tab('Password').tabIndex).toBe(0);
    expect(tab('Account').tabIndex).toBe(-1);
    expect(panelOf('Password').textContent).toBe('Security panel');
    expect(panelOf('Password').hidden).toBe(false);
  });
});

describe('Tabs without a value', () => {
  function Swappable(): ReactElement {
    const [second, setSecond] = useState(false);
    return (
      <>
        <button
          onClick={() => {
            setSecond(true);
          }}
        >
          swap
        </button>
        <Tabs.Root>
          <Tabs.List aria-label="Tabs">
            {second ? (
              <>
                <Tabs.Trigger value="c">C</Tabs.Trigger>
                <Tabs.Trigger value="d">D</Tabs.Trigger>
              </>
            ) : (
              <>
                <Tabs.Trigger value="a">A</Tabs.Trigger>
                <Tabs.Trigger value="b">B</Tabs.Trigger>
              </>
            )}
          </Tabs.List>
          <Tabs.Content value="a">A panel</Tabs.Content>
          <Tabs.Content value="c">C panel</Tabs.Content>
        </Tabs.Root>
      </>
    );
  }

  it('selects the first tab of the new set when every trigger is replaced', async () => {
    const user = userEvent.setup();
    render(<Swappable />);
    expect(selectedTabs()).toEqual(['A']);
    await user.click(screen.getByRole('button', { name: 'swap' }));
    expect(selectedTabs()).toEqual(['C']);
    expect(tab('C').tabIndex).toBe(0);
    expect(panelOf('C').hidden).toBe(false);
  });
});
