// import { JsonPipe } from '@angular/common';
// import { Component, inject, input } from '@angular/core';

// import { BasicOverlayExampleComponent } from './basic-overlay-example.component';
// import { OverlayConfig } from '../../../src/models/overlay-config.model';
// import { OverlayService } from '../../../src/services/overlay.service';

// @Component({
//   standalone: true,
//   selector: 'story-basic',
//   imports: [JsonPipe],
//   template: ` <button class="story-button" (click)="onOpenClick()">Open Overlay</button> `,
//   styles: [
//     `
//       :host {
//         min-width: 300px;
//         min-height: 100px;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//       }
//     `,
//   ],
//   host: {
//     class: 'story-card',
//   },
// })
// export class BasicOverlayStoryComponent {
//   overlayConfig = input<Partial<OverlayConfig>>({});
//   private overlay = inject(OverlayService);

//   async onOpenClick() {
//     this.overlay.open(BasicOverlayExampleComponent, this.overlayConfig());
//   }
// }
