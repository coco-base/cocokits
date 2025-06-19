import React, { createContext, useRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import {  useAnimation, useEffectAfterMount, useOnInit, useSlotChildren, useStaticText } from '@cocokits/react-utils';

import { useAccordionStore } from '../accordion.store';

export interface AccordionPanelProps<TValue extends string | number> extends UIBaseComponentProps {
  /**
   * The unique identifier for the accordion panel.
   * @defaultValue The id will be generated automatically.
   */
  value?: TValue;

  /**
   * Whether the accordion panel is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * The header and content type of the accordion panel.
   */
  children: React.ReactNode;
}

export const AccordionPanelContext = createContext<{
  id: string,
  disabled: boolean | undefined;
} | null>(null);

export const AccordionPanel = ({
  type,
  size,
  color,
  additional,
  value: _value,
  disabled,
  children,
}: AccordionPanelProps<string>) => {
  const id = useStaticText();
  const value = _value ?? id;

  const store = useAccordionStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const animation = useAnimation(contentRef, {initializeValues: { dimension: { height: 0 } } });

  if(!store) {
    throw new Error('AccordionPanel must be used within an Accordion.');
  }

  useOnInit(() => store.addPanel({ id, value }));

  // Must be called after addPanel to ensure the store is initialized
  const isExpanded = store.isExpanded(id);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'accordionPanel',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: isExpanded, classes: (cn) => [cn.expanded] },
      { if: !isExpanded, classes: (cn) => [cn.collapsed] },
      { if: disabled, classes: (cn) => [cn.disabled] },
    ],
  });

  // Run animation on expanded changed
  useEffectAfterMount(() => {
    if(!contentRef.current) {
      return;
    }

    const height = isExpanded ? getOriginalHeight(contentRef.current) : 0;

    animation?.setDimension({ height });

    const animate = store.getState().instantAnimation
      ? animation?.apply()
      : animation?.animate({ easing: cubicBezierEasing, duration: store.getState().animationDuration });

    if (isExpanded) {
      animate?.then(() => {
        if (contentRef.current) {
          contentRef.current.style.height = `auto`;
        }
      });
    }
  }, [isExpanded]);

  const [headerChild, contentChildren] = useSlotChildren(children, 'AccordionHeader');

  return (
    <AccordionPanelContext.Provider value={{ id, disabled }}>
      <div className={hostClassNames}>
        {headerChild}
        <div ref={contentRef} className={classNames.contentWrapper}>{contentChildren}</div>
      </div>
    </AccordionPanelContext.Provider>
  );
};

AccordionPanel.displayName = 'AccordionPanel';
export default AccordionPanel;


export function getOriginalHeight(element: HTMLElement): number {
  element.style.opacity = '0';
  element.style.display = 'block';
  element.style.height = 'auto';

  const height = element.offsetHeight;
  element.style.height = '0';
  element.style.opacity = '1';

  return height;
}

// eslint-disable-next-line no-mixed-operators
const cubicBezierEasing = (x: number) => 1 - (1 - x) * (1 - x);