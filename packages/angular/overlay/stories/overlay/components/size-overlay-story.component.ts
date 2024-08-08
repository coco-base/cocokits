import { Component, inject } from '@angular/core';

import { SizeOverlayExampleComponent } from './size-overlay-example.component';
import { OverlayService } from '../../../src/services/overlay.service';

@Component({
  standalone: true,
  selector: 'story-size',
  imports: [],
  template: `
    <button class="story-button" (click)="onOpenMinMaxClick()">min/max width/height</button>
    <button class="story-button" (click)="onOpenClick()">Fix width/height</button>
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
export class SizeOverlayStoryComponent {
  private overlay = inject(OverlayService);

  onOpenMinMaxClick() {
    this.overlay.open(SizeOverlayExampleComponent, {
      size: {
        minWidth: '320px',
        maxWidth: '500px',
        minHeight: '320px',
        maxHeight: '500px',
      },
    });
  }

  onOpenClick() {
    this.overlay.open(SizeOverlayExampleComponent, {
      size: {
        width: '400px',
        height: '400px',
      },
    });
  }
}
