// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Checkbox, Radio, Switch } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Checkbox defaultChecked size="sm" color="success">
          Accept
        </Checkbox>
        <Switch labelPosition="before">Alerts</Switch>
        <fieldset>
          <Radio name="plan" value="a" defaultChecked>
            A
          </Radio>
          <Radio name="plan" value="b" size="lg">
            B
          </Radio>
        </fieldset>
      </ThemeProvider>
    </StrictMode>
  );
}

describe('theme choice controls hydration', () => {
  it('hydrates the server markup without a mismatch and stays interactive', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App />);
    const serverHtml = container.innerHTML;

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);

    await userEvent.click(screen.getByRole('switch', { name: 'Alerts' }));
    expect(container.querySelector('.cck-switch')?.hasAttribute('data-checked')).toBe(true);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Accept' }));
    expect(container.querySelector('.cck-checkbox')?.hasAttribute('data-checked')).toBe(false);
    await userEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(container.querySelectorAll('.cck-radio[data-checked]')).toHaveLength(1);
  });
});
