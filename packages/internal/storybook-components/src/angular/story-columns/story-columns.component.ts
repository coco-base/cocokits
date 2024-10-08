import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  standalone: true,
  selector: 'story-columns',
  template: ` <ng-content></ng-content> `,
  styles: `
    story-columns {
      display: flex;
      width: 100%;
      height: 100%;
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class StoryColumnsComponent {}

@Component({
  standalone: true,
  selector: 'story-column',
  styles: `
    story-column {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;
      gap: 12px;
    }
    story-column:not(:last-of-type) {
      border-right: 1px solid var(--cck-storybook-color-border-alpha-5);
    }
  `,
  template: ` <ng-content></ng-content> `,
  encapsulation: ViewEncapsulation.None,
})
export class StoryColumnComponent {}
