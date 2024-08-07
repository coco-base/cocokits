import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { BasicOverlayExampleComponent } from './basic-overlay-example.component';
import { OverlayAnimationType } from '../../../src/models/overlay-config.model';
import { OverlayService } from '../../../src/services/overlay.service';

@Component({
  standalone: true,
  selector: 'story-animation',
  imports: [JsonPipe],
  template: `
    <div class="row">
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.None)">None</button>
    </div>
    <div class="row">
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.TopToCenter)">Top To Center</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.RightToCenter)">Right To Center</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.BottomToCenter)">Bottom To Center</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.LeftToCenter)">Left To Center</button>
    </div>
    <div class="row">
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToTopLeft)">To Top Left</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToTopCenter)">To Top Center</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToTopRight)">To Top Right</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToRightCenter)">To Right Center</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToBottomRight)">To Bottom Right</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToBottomCenter)">To Bottom Center</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToBottomLeft)">To Bottom Left</button>
      <button class="story-button" (click)="onOpenClick(OverlayAnimationType.ToLeftCenter)">To Left Center</button>
    </div>
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
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--cck-storybook-color-border-alpha-default);
      }
      .row:first-of-type {
        border-top: none;
      }
    `,
  ],
  host: {
    class: 'story-card',
  },
})
export class AnimationOverlayStoryComponent {
  private overlay = inject(OverlayService);
  protected readonly OverlayAnimationType = OverlayAnimationType;

  async onOpenClick(animationType: OverlayAnimationType) {
    this.overlay.open(BasicOverlayExampleComponent, {
      positionStrategy: {
        type: 'auto',
        animationType,
      },
    });
  }
}
