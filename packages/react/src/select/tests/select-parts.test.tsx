// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '../index';
import { stubTopLayer, Dishes, Opt } from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('combobox');

describe('Select render', () => {
  const dish = (): ReturnType<typeof render> =>
    render(
      <Dishes defaultOpen>
        <Select.Group>
          <Select.Label>Desserts</Select.Label>
          <Opt value="Cake">Cake</Opt>
        </Select.Group>
        <Select.Separator />
      </Dishes>,
    );

  it('renders a div for the root, the group and the item, and the separator, by default', async () => {
    const { container } = dish();
    await screen.findByRole('listbox');
    expect(container.querySelector(`.${classes.root}`)?.localName).toBe('div');
    expect(screen.getByRole('group').localName).toBe('div');
    expect(screen.getByRole('option').localName).toBe('div');
    const separator = document.querySelector(`.${classes.separator}`);
    expect(separator?.localName).toBe('div');
    expect(separator?.getAttribute('aria-hidden')).toBe('true');
    expect(separator?.hasAttribute('role')).toBe(false);
  });

  it('keeps role, classes and data-* when the root, the group and the item take another element', async () => {
    const { container } = render(
      <Select.Root defaultOpen render={<section />}>
        <Select.Trigger aria-label="Dish">
          <Select.Value />
        </Select.Trigger>
        <Select.Content render={<ul />}>
          <Select.Group render={<ul />}>
            <Select.Label render={<li />}>Desserts</Select.Label>
            <Select.Item value="Cake" render={<li />}>
              <Select.ItemIndicator render={<i />} />
              <Select.ItemText render={<b />}>Cake</Select.ItemText>
            </Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>,
    );
    const list = await screen.findByRole('listbox');
    const root = container.querySelector(`.${classes.root}`);
    expect(root?.localName).toBe('section');
    expect(root?.getAttribute('data-state')).toBe('open');
    expect(trigger().closest('section')).toBe(root);
    expect(list.localName).toBe('ul');
    expect(list.className).toBe(classes.content);
    const group = screen.getByRole('group');
    expect(group.localName).toBe('ul');
    expect(group.className).toBe(classes.optionGroup);
    expect(group.hasAttribute('data-disabled')).toBe(false);
    expect(group.querySelector(`.${classes.optionGroupLabel}`)?.localName).toBe('li');
    const option = screen.getByRole('option');
    expect(option.localName).toBe('li');
    expect(option.className).toBe(classes.option);
    expect(option.hasAttribute('data-selected')).toBe(false);
    expect(option.querySelector(`.${classes.optionContent}`)?.localName).toBe('b');
    expect(option.querySelector(`.${classes.optionIndicator}`)?.localName).toBe('i');
  });

  it('accepts the function form and reaches the author ref', async () => {
    let seen: HTMLElement | null = null;
    render(
      <Dishes defaultOpen>
        <Opt
          value="Cake"
          ref={(node) => {
            seen = node;
          }}
          render={(props) => <p {...props} />}
        >
          Cake
        </Opt>
      </Dishes>,
    );
    const option = await screen.findByRole('option');
    expect(option.localName).toBe('p');
    expect(seen).toBe(option);
  });

  it('renders the trigger as another element with nativeButton={false}', () => {
    render(
      <Select.Root>
        <Select.Trigger aria-label="Dish" nativeButton={false} render={<div />}>
          <Select.Value placeholder="Choose" />
        </Select.Trigger>
      </Select.Root>,
    );
    expect(trigger().localName).toBe('div');
    expect(trigger().getAttribute('role')).toBe('combobox');
    expect(trigger().getAttribute('tabindex')).toBe('0');
    expect(trigger().hasAttribute('type')).toBe(false);
  });

  it('puts the item id on the option and the trigger active descendant', async () => {
    const user = userEvent.setup();
    render(
      <Dishes>
        <Opt value="Cake" id="cake-option">
          Cake
        </Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(screen.getByRole('option').id).toBe('cake-option');
    expect(trigger().getAttribute('aria-activedescendant')).toBe('cake-option');
  });
});
