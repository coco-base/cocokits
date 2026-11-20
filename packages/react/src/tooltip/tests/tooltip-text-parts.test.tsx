// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { accessibleDescription, stubTopLayer, tooltipContent, tooltipDescription } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const parts = (
  <Tooltip.Root defaultOpen>
    <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
    <Tooltip.Content>
      <Tooltip.Title>Copy link</Tooltip.Title>
      <Tooltip.Description>Copies the address.</Tooltip.Description>
    </Tooltip.Content>
  </Tooltip.Root>
);

describe('Tooltip title and description', () => {
  it.each([
    ['title', 'cck-tooltip__title', 'Copy link'],
    ['description', 'cck-tooltip__description', 'Copies the address.'],
  ])('renders the %s as a div with its class and no role inside the content', (_name, className, text) => {
    render(parts);
    const part = tooltipContent()?.querySelector(`.${className}`);
    expect(part?.tagName).toBe('DIV');
    expect(part?.textContent).toBe(text);
    expect(part?.hasAttribute('role')).toBe(false);
  });

  it('is read by the trigger description, both parts, while the tooltip is shown', () => {
    render(parts);
    expect(accessibleDescription(screen.getByRole('button', { name: 'Copy link' }))).toBe(
      'Copy link Copies the address.',
    );
  });

  it('describes the closed trigger from the title and the description, one space apart', async () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Title>Copy link</Tooltip.Title>
          <Tooltip.Description>Copies the address</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    expect(tooltipContent()).toBeNull();
    expect(tooltipDescription()?.hasAttribute('hidden')).toBe(true);
    expect(tooltipDescription()?.id).toBe(trigger.getAttribute('aria-describedby'));
    expect(accessibleDescription(trigger)).toBe('Copy link Copies the address');
  });

  it('ignores text written beside the parts in the description', async () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Autosave">Autosave</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Title>Autosave</Tooltip.Title>
          note
          <Tooltip.Description>Changes are saved as you type.</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    expect(accessibleDescription(screen.getByRole('button', { name: 'Autosave' }))).toBe(
      'Autosave Changes are saved as you type.',
    );
  });

  it('passes native props and renders the author element', () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Title className="mine" data-test="x" render={<h4 />}>
            Title
          </Tooltip.Title>
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    const title = tooltipContent()?.querySelector('h4');
    if (!title) throw new Error('no title');
    expect(title.tagName).toBe('H4');
    expect(title.className).toBe('cck-tooltip__title mine');
    expect(title.getAttribute('data-test')).toBe('x');
  });

  it('throws outside a Tooltip.Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderToString(<Tooltip.Title>Title</Tooltip.Title>)).toThrow(
      'CocoKits: <Tooltip.Title> must be placed within <Tooltip.Root>.',
    );
    expect(() => renderToString(<Tooltip.Description>Text</Tooltip.Description>)).toThrow(
      'CocoKits: <Tooltip.Description> must be placed within <Tooltip.Root>.',
    );
  });
});
