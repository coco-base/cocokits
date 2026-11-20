'use client';

import { isValidElement, useCallback, useId, useMemo, useState, type ReactElement, type Ref } from 'react';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useControllableState } from '../internal/use-controllable-state';
import { useMergedRef } from '../internal/use-merged-ref';
import { useMenuContext } from './menu-context';
import {
  MenuGroupContext,
  MenuRadioGroupContext,
  type MenuGroupContextValue,
  type MenuRadioGroupContextValue,
} from './menu-part-contexts';
import type { MenuItemChangeDetails, MenuRadioGroupProps } from './menu-parts.types';
import type { MenuPart, MenuRenderProps, MenuState } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function MenuRadioGroupImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  render,
  ref,
  ...rest
}: MenuRadioGroupProps): ReactElement {
  const context = useMenuContext('Menu.RadioGroup');
  const id = useId();
  const themeAttrs = useThemeAttrs(menuAnatomy).radioGroup;
  const [value, setValue] = useControllableState<string | undefined, MenuItemChangeDetails>({
    value: valueProp,
    defaultValue,
    onChange: (next, details) => {
      if (next !== undefined) onValueChange?.(next, details);
    },
    name: '<Menu.RadioGroup value>',
  });
  const [labels, setLabels] = useState(0);
  const registerLabel = useCallback((): (() => void) => {
    setLabels((count) => count + 1);
    return () => {
      setLabels((count) => count - 1);
    };
  }, []);
  const { radioGroup } = getMenuProps({ id: context.id, open: context.open }, context.dispatch);
  const machineProps = radioGroup({ id, hasLabel: labels > 0 });
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs, ...toReactProps(machineProps), ref: mergedRef },
    rest,
  ) as unknown as MenuRenderProps;

  const radio = useMemo<MenuRadioGroupContextValue>(
    () => ({
      value,
      setValue: (next, event) => {
        setValue(next, { reason: 'user', event });
      },
    }),
    [value, setValue],
  );
  const group = useMemo<MenuGroupContextValue>(() => ({ id, registerLabel }), [id, registerLabel]);
  return (
    <MenuGroupContext.Provider value={group}>
      <MenuRadioGroupContext.Provider value={radio}>
        {renderElement<MenuRenderProps, MenuState>(render, 'div', props, { open: context.open })}
      </MenuRadioGroupContext.Provider>
    </MenuGroupContext.Provider>
  );
}

/**
 * A set of radio items with one value. It renders a `<div role="group">`. A `Menu.GroupLabel` inside it names it;
 * give the group an `aria-label` for another name.
 *
 * Control the value with `value` and `onValueChange`, or set `defaultValue` and let the group keep it. A
 * `Menu.RadioItem` is checked while its `value` is the value of the group.
 *
 * @example
 * <Menu.RadioGroup defaultValue="name">
 *   <Menu.GroupLabel>Sort by</Menu.GroupLabel>
 *   <Menu.RadioItem value="name">Name</Menu.RadioItem>
 *   <Menu.RadioItem value="date">Date</Menu.RadioItem>
 * </Menu.RadioGroup>
 * @cckPart radioGroup
 * @param props - The RadioGroup props.
 * @returns The rendered element inside the providers.
 */
export const MenuRadioGroup: MenuPart<MenuRadioGroupProps> = Object.assign(MenuRadioGroupImpl, {
  displayName: 'Menu.RadioGroup',
});
