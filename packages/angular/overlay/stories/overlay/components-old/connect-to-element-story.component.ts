import { JsonPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { BasicOverlayExampleComponent } from './basic-overlay-example.component';
import { OverlayConnectElemOrigin } from '../../../src/models/overlay-config.model';
import { OverlayService } from '../../../src/services/overlay.service';

@Component({
  standalone: true,
  selector: 'story-connect-to-element',
  imports: [JsonPipe],
  template: `
    <button
      #buttonElemRef1
      class="story-button"
      (click)="onOpenClick(buttonElemRef1, OverlayConnectElemOrigin.TopLeft)">
      Top Left
    </button>
    <button
      #buttonElemRef2
      class="story-button"
      (click)="onOpenClick(buttonElemRef2, OverlayConnectElemOrigin.TopRight)">
      Top Right
    </button>
    <button
      #buttonElemRef4
      class="story-button"
      (click)="onOpenClick(buttonElemRef4, OverlayConnectElemOrigin.BottomRight)">
      Bottom Right
    </button>
    <button
      #buttonElemRef3
      class="story-button"
      (click)="onOpenClick(buttonElemRef3, OverlayConnectElemOrigin.BottomLeft)">
      Bottom Left
    </button>
  `,
  styles: [
    `
      :host {
        min-width: 300px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-wrap: wrap;
        gap: 24px;
      }
    `,
  ],
  host: {
    class: 'story-card',
  },
})
export class ConnectToElementStoryComponent {
  private overlay = inject(OverlayService);
  protected panelClass = input<string[]>([]);

  protected OverlayConnectElemOrigin = OverlayConnectElemOrigin;

  async onOpenClick(connectTo: HTMLElement, origin: OverlayConnectElemOrigin) {
    this.overlay.open(BasicOverlayExampleComponent, {
      panelClass: this.panelClass(),
      positionStrategy: {
        type: 'connectToElement',
        connectTo,
        origin,
      },
    });
  }
}
