import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ErrorComponent,
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  ObjToKeysPipe,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-hint-success.config';

@Component({
  standalone: true,
  selector: 'cck-input-hint-success',
  imports: [
    FormFieldComponent,
    LabelComponent,
    InputComponent,
    ErrorComponent,
    HintComponent,
    ReactiveFormsModule,
    SvgIconComponent,
    ObjToKeysPipe,
  ],
  template: `
    <cck-form-field>
      <cck-label>Username</cck-label>
      <input cck-input [formControl]="usernameControl" />

      @if (usernameControl.valid) {
        <cck-hint [color]="cckExampleArgs().hintColor">
          <cck-svg-icon [icon]="Icons.checkCircle"></cck-svg-icon>
          <span>Username is available!</span>
        </cck-hint>
      }

      <cck-error>
        <cck-svg-icon [icon]="Icons.warning"></cck-svg-icon>
        <span>{{ errorMessages[(usernameControl.errors | objToKeys)[0]] }}</span>
      </cck-error>
    </cck-form-field>
  `,
  styles: ``,
})
export class InputHintSuccessComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
  protected usernameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(10),
    Validators.pattern(/^[A-Za-z0-9-]+$/),
  ]);

  protected errorMessages = {
    required: 'Username is required',
    minlength: 'Must be at least 3 characters',
    maxlength: 'Cannot exceed 10 characters',
    pattern: 'Only letters, digits, and hyphens allowed',
  };
}
