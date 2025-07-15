// import { JsonPipe } from '@angular/common';
// import { Component, inject } from '@angular/core';

// import { OverlayRef } from '../../../src/services/overlay-ref';

// @Component({
//   imports: [JsonPipe],
//   template: `
//     <p class="p-sm-regular-4">THIS IS A OVERLAY</p>
//     <button class="story-button" (click)="onCloseClick()">Close</button>
//   `,
//   styles: [
//     `
//       :host {
//         display: flex;
//         flex-direction: column;
//         gap: 24px;
//       }
//     `,
//   ],
//   host: {
//     class: 'story-card',
//   },
// })
// export class BasicOverlayExampleComponent {
//   overlayRef = inject(OverlayRef);

//   onCloseClick() {
//     this.overlayRef.close();
//   }
// }
