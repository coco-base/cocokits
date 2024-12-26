import events from "@storybook/core/core-events";
import { addons } from '@storybook/manager-api';
import { filter } from "rxjs";

import { getInstance } from "@cocokits/common-utils";
import { ThemeConfigContext } from "@cocokits/react-core";
import { openStandaloneOverlay, OverlayAnimationType, OverlayConfigStandalone, RenderedOverlay } from "@cocokits/react-overlay";

import { Sidebar } from "./sidebar";
import { storybookAddonThemeConfig } from "../../../theme/theme-config";
import { GlobalEvent } from "../../data-access/global-event/manager-global-event";
import { fromStorybookEvent } from "../../utils/rxjs.util";
import { StoryControlDialog, StoryControlDialogProps } from "../story-control/story-control-dialog";
import { TokenInfoDialog } from "../token-dictionary/token-info-dialog";

/**
 * This Service will be render in manager
 */

const DEFAULT_OVERLAY_CONFIG: Partial<OverlayConfigStandalone<unknown>> = {
  zIndex: 5,
  hasBackdrop: false,
  allowInteractionBehindOverlay: true,
  positionStrategy: {
    type: 'auto',
    animationType: OverlayAnimationType.ToRightCenter,
  },
  decorator: (children) => (
    <ThemeConfigContext.Provider value={storybookAddonThemeConfig}>
      {children}
    </ThemeConfigContext.Provider>
  )
};

export class SidebarService {
  private globalEvent = getInstance(GlobalEvent);
  private storyControlRef: RenderedOverlay<void> | null = null;
  private tokenInfoRef: RenderedOverlay<void> | null = null;

  constructor() {

    fromStorybookEvent(addons.getChannel(), events.SET_CURRENT_STORY);

    this.globalEvent.pageChange$.subscribe(() => {
      this.closeAll();
    });

    this.globalEvent.closeStoryControl$.subscribe(() => {
      this.closeStoryControl();
    });

    this.globalEvent.closeTokenInfo$.subscribe(() => {
      this.closeTokenInfo();
    });


    this.globalEvent.openStoryControl$.subscribe((params) => {
      this.onOpenStoryControl(params);
    });

    this.globalEvent.changeTokenInfo$.pipe(
      filter(() => this.tokenInfoRef === null) // Skip if token info is already open, The component must get the changes without rerender 
    ).subscribe(() => {
      this.onOpenTokenInfo();
    });
  }

  private onOpenStoryControl(params: StoryControlDialogProps) {
    this.closeStoryControl();

    const overlayRef = openStandaloneOverlay(Sidebar<StoryControlDialogProps, void>, {
      ...DEFAULT_OVERLAY_CONFIG,
      data: {
        title: 'Control',
        data: params,
        componentRef: StoryControlDialog
      }
    });

    this.storyControlRef = overlayRef;

    overlayRef.closed.then(() => {
      this.globalEvent.dispatch.closeStoryControl();
      this.storyControlRef = null;
    });
  }

  private onOpenTokenInfo() {

    const overlayRef = openStandaloneOverlay(Sidebar<void, void>, {
      ...DEFAULT_OVERLAY_CONFIG,
      data: {
        title: 'Token Info',
        componentRef: TokenInfoDialog
      },
    });

    this.tokenInfoRef = overlayRef;

    overlayRef.closed.then(() => {
      this.globalEvent.dispatch.closeTokenInfo();
      this.tokenInfoRef = null;
    });
  }

  public closeAll() {
    this.closeStoryControl();
    this.closeTokenInfo();
  }

  public closeStoryControl() {
    this.storyControlRef?.close();
    this.storyControlRef = null;
  }

  public closeTokenInfo() {
    this.tokenInfoRef?.close();
    this.tokenInfoRef = null;
  }
}