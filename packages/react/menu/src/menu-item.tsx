'use client';
import { ReactNode, useContext } from "react";

import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";
import { OverlayContext, OverlayRef } from "@cocokits/react-overlay";
import { MenuOverlayParams } from "./menu";

interface MenuItemProps extends UIBaseComponentProps {

  /**
   * If true, the menu item will be disabled.
   */
  disabled?: boolean;

  /**
   * The content of the component.
   */
  children?: ReactNode | ReactNode[];

  /**
   * Extend the class names applied to the component.
   */
  className?: string;

  /**
   * Override or extend the styles applied to the component.
   */
  style?: React.CSSProperties;
}


export function MenuItem(props: MenuItemProps) {

  const overlayContext = useContext(OverlayContext) as OverlayRef<MenuOverlayParams, void>;

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: "menuItem",
    props: {
      ...props,
      size: props.size ?? overlayContext?.data.menuSize
    },
    extraHostElementClassConditions: [
      { if: !!props.className, classes: () => [props.className] },
      { if: props.disabled, classes: (cn) => [cn.disabled] }
    ]
  });

  const onHostClick = () => {
    if(props.disabled || overlayContext.data.closeOnSelectItem === false) {
      return;
    }

    overlayContext?.close();
  };


  return (
    <div className={hostClassNames} style={props.style} onClick={onHostClick}>
      {props.children}
    </div>
  );
}



MenuItem.displayName = "MenuItem";
export default MenuItem;