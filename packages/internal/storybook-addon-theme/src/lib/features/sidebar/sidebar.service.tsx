import events from "@storybook/core/core-events";
import { addons } from '@storybook/manager-api';
import { merge } from "rxjs";

import { getInstance } from "@cocokits/common-utils";
import { ThemeConfigContext } from "@cocokits/react-core";
import { openStandaloneOverlay, OverlayAnimationType, RenderedOverlay } from "@cocokits/react-overlay";

import { Sidebar } from "./sidebar";
import { storybookAddonThemeConfig } from "../../../theme/theme-config";
import { GlobalEvent } from "../../data-access/global-event/manager-global-event";
import { fromStorybookEvent } from "../../utils/rxjs.util";
import { StoryControlDialog, StoryControlDialogProps } from "../story-control/story-control-dialog";

/**
 * This Service will be render in manager
 */

export class SidebarService {
  private globalEvent = getInstance(GlobalEvent);
  private storyControlRef: RenderedOverlay<void> | null = null;

  constructor() {

    merge(
      this.globalEvent.closeStoryControl$,
      this.globalEvent.pageChange$
    ).subscribe(() => {
      this.closeStoryControl();
    });

    fromStorybookEvent(addons.getChannel(), events.SET_CURRENT_STORY);

    this.globalEvent.openStoryControl$.subscribe((params) => {
      
      this.closeStoryControl();

      const overlayRef = openStandaloneOverlay(Sidebar<StoryControlDialogProps, void>, {
        zIndex: 5,
        data: {
          title: 'Control',
          data: params,
          componentRef: StoryControlDialog
        },
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
      });

      this.storyControlRef = overlayRef;

      overlayRef.closed.then(() => {
        this.globalEvent.dispatch.closeStoryControl();
        this.storyControlRef = null;
      });
    });
  }

  public closeStoryControl() {
    this.storyControlRef?.close();
    this.storyControlRef = null;
  }
}