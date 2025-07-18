import React, { useCallback, useContext } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { ThemeConfigContext, useUiBaseComponentConfig } from '@cocokits/react-core';
import { SvgIcon } from '@cocokits/react-icon';

import { useAccordionStore } from '../accordion.store';
import { AccordionPanelContext } from '../accordion-panel/accordion-panel';

export interface AccordionHeaderProps extends UIBaseComponentProps {
   /**
   * Template for the accordion icon, that will apply to on;y this header.
   * Can be a React node, an array of React nodes, or a function that returns a React node.
   * If a function is provided, it receives an object containing the `isExpanded` and `disabled` properties.
   */
  iconTemplate?:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: { isExpanded: boolean; disabled: boolean }) => React.ReactNode);

  /**
   * The content of the accordion header, such as a title or any custom template.
   */
  children?: React.ReactNode;
}

export const AccordionHeader = ({ type, size, color, additional, iconTemplate, children }: AccordionHeaderProps) => {
  const store = useAccordionStore();
  const panelContext = useContext(AccordionPanelContext);
  const themeConfig = useContext(ThemeConfigContext);

  const expandedIcon = themeConfig?.components.accordion?.templates?.accordionExpandedIcon;
  const collapsedIcon = themeConfig?.components.accordion?.templates?.accordionCollapsedIcon;

  if(!store) {
    throw new Error('AccordionHeader must be used within an Accordion.');
  }
  if (!panelContext) {
    throw new Error('AccordionHeader must be used within an AccordionPanel.');
  }

  const isExpanded = store?.isExpanded(panelContext.id);
  const iconPosition = store.useState((state) => state.iconPosition);
  const toggleTrigger = store.useState((state) => state.toggleTrigger);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'accordionHeader',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: iconPosition === 'left', classes: (cn) => [cn.iconLeft] },
      { if: iconPosition === 'right', classes: (cn) => [cn.iconRight] },
      { if: toggleTrigger === 'icon', classes: (cn) => [cn.triggerIcon] },
      { if: toggleTrigger === 'header', classes: (cn) => [cn.triggerHeader] },
    ],
  });

  const onHostClick = () => {
    if (panelContext.disabled || store?.getState().toggleTrigger !== 'header') {
      return;
    }

    store?.toggle(panelContext.id);
  };

  const toggle = () => {
    if (panelContext.disabled || store?.getState().toggleTrigger !== 'icon') {
      return;
    }

    store?.toggle(panelContext.id);
  };

  const iconContent = useCallback(() => {
    if (typeof iconTemplate === 'function') {
      return iconTemplate({ isExpanded: isExpanded ?? false, disabled: panelContext.disabled ?? false });
    }

    if(iconTemplate) {
      return iconTemplate as React.ReactNode;
    }

    const globalIconTemplate = store.getState().iconTemplate;

    if (typeof globalIconTemplate === 'function') {
      return globalIconTemplate({ isExpanded: isExpanded ?? false, disabled: panelContext.disabled ?? false });
    }

    if(globalIconTemplate) {
      return globalIconTemplate as React.ReactNode;
    }

    if(!expandedIcon || !collapsedIcon) {
      throw new Error('`expandedIcon` and `collapsedIcon` must be defined in the theme configuration.');
    }

    return (
      <SvgIcon icon={isExpanded ? expandedIcon : collapsedIcon}></SvgIcon>
    );
  }, [iconTemplate, isExpanded, panelContext.disabled]);

  return (
    <div className={hostClassNames} onClick={onHostClick}>
      {children}
      <button className={classNames.iconBtn} onClick={toggle}>
        {iconContent()}
      </button>
    </div>
  );
};

AccordionHeader.displayName = 'AccordionHeader';
export default AccordionHeader;
