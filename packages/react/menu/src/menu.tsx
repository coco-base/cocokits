'use client';
import { CSSProperties, ReactNode, useCallback, useEffect, useState } from 'react';

import { ElementAnchorPoint } from '@cocokits/common-utils';
import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { OverlayConfig, OverlayContext, OverlayPortal, OverlayPortalManager, OverlayRef, RenderedOverlay } from "@cocokits/react-overlay";
import { useSilentState, useStaticText } from '@cocokits/react-utils';

export interface MenuProps extends UIBaseComponentProps {

  /**
   * Whether the menu should be shown or not.
   */
  open?: boolean;

  /**
   * The size of menu overlay, if not provided it will take the size of children elements
   */
  overlaySizes?: OverlayConfig['size'];

  /**
   * The Anchor point of menu related to the target element
   */
  menuAnchorPoint?: ElementAnchorPoint;

  /**
   * References the target element that the menu is associated with.
   */
  targetRef?: React.RefObject<HTMLElement>;

  /**
   * Whether the menu should be closed when an item is selected.
   */
  closeOnSelectItem?: boolean;

  /**
   * It's an internal prop to skip the overlay creation and directly open the menu.
   * @internal
   */
  _skipOverlay?: boolean;

  /**
   * Called when the associated menu is opened.
   */
  onMenuOpened?: () => void;

  /**
   * Called when the associated menu is closed.
   */
  onMenuClosed?: () => void;

  /**
   * Called when the associated menu status changes to open or close.
   */
  onMenuStatusChange?: (isOpen: boolean) => void;

  /**
   * The css class name for the overlay panel.
   */
  overlayPanelClassName?: string[];

  children: ReactNode | ReactNode[];
  className? : string;
  style?: CSSProperties;
}


export interface MenuOverlayParams {
  closeOnSelectItem?: boolean;
  menuSize?: MenuProps['size'];
}

export function Menu(props: MenuProps) {  

  const overlayId = useStaticText();
  const [isOpen, setIsOpen] = useState(false);
  const [renderedOverlay, setRenderedOverlay] = useSilentState<RenderedOverlay<void>>();

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: "menu",
    props,
    extraHostElementClassConditions: [
      { if: !!props.className, classes: () => [props.className] }
    ]
  });

  useEffect(() => {
    props.open ? onOpen() : onClose();
  }, [props.open]);

  const onOpen = useCallback(() => {
    if(isOpen || !props.targetRef?.current) {
      return;
    }
    
    // To fix the error on non-browser environments such as nextJS or web workers
    const connectTo = props.targetRef?.current ?? (typeof document !== 'undefined' ? document.body : (null as any));

    const panelClass = [...props.overlayPanelClassName ?? [], classNames.overlay];

    const _renderedOverlay = OverlayPortalManager.getWithId<MenuOverlayParams, void>(overlayId).open({
      panelClass,
      size: props.overlaySizes,
      positionStrategy: {
        type: 'connectToElement',
        connectTo,
        anchorPoint: props.menuAnchorPoint ?? ElementAnchorPoint.BottomRight,
      },
      data: {
        closeOnSelectItem: props.closeOnSelectItem,
        menuSize: props.size
      },
    });

    setRenderedOverlay(_renderedOverlay);

    setIsOpen(true);
    props.onMenuOpened?.();
    props.onMenuStatusChange?.(true);


    _renderedOverlay.afterClosed.then(() => {
      setIsOpen(false);
      props.onMenuClosed?.();
      props.onMenuStatusChange?.(false);
    });
  }, [props.onMenuOpened, props.onMenuStatusChange, setIsOpen]);

  const onClose = useCallback(() => {
    if(!isOpen) {
      return;
    }
    renderedOverlay?.close();

  }, [isOpen, renderedOverlay]);


  if(props._skipOverlay && props.open) {

    const overlayRef: OverlayRef<MenuOverlayParams, void> = {
      data: {
        closeOnSelectItem: props.closeOnSelectItem,
        menuSize: props.size
      },
      close: () => {
        // Dummy close function
      },
    };

    return (
      <OverlayContext.Provider value={overlayRef}>
        <div className={hostClassNames} style={props.style}>
          {props.children}
        </div>
      </OverlayContext.Provider>
    );
  }

  return (
    <OverlayPortal portalId={overlayId}>
      <div className={hostClassNames} style={props.style}>
        {props.children}
      </div>
    </OverlayPortal>
  );
}

Menu.displayName = 'Menu';
export default Menu;