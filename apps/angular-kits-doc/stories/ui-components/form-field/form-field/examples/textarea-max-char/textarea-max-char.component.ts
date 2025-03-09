import { Component, input, signal } from '@angular/core';

import { FormFieldComponent, HintComponent, LabelComponent, TextareaComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/textarea-max-char.config';

@Component({
  standalone: true,
  selector: 'cck-textarea-max-char',
  imports: [FormFieldComponent, TextareaComponent, LabelComponent, HintComponent],
  template: `
    <cck-form-field>
      <cck-label>Description</cck-label>
      <textarea
        cck-textarea
        [maxLength]="maxLength"
        placeholder="Short project description"
        (input)="onChange($event)"></textarea>
      <cck-hint>{{ valueLength() }}/{{ maxLength }} characters max</cck-hint>
    </cck-form-field>
  `,
  styles: ``,
})
export class TextareaMaxCharComponent {
  public cckExampleArgs = input.required<ExampleArgs>();

  protected readonly maxLength = 10;
  protected valueLength = signal(0);

  protected onChange(e: Event) {
    const textareaElem = e.target as HTMLTextAreaElement;
    this.valueLength.set(textareaElem.value.length);
  }
}
