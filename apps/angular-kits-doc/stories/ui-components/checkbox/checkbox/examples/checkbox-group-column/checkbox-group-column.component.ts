import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-column.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-group-column',
  imports: [CheckboxComponent],
  template: `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <i style="color: var(--checkbox-group-column-color);">My hobbies</i>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Comic books</cck-checkbox>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Listen to music</cck-checkbox>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Travel the world</cck-checkbox>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Watch movies</cck-checkbox>
    </div>
  `,
  styles: ``,
})
export class CheckboxGroupColumnComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
