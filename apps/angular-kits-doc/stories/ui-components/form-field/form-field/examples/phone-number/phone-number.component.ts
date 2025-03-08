import { Component, input, signal } from '@angular/core';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import {
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  OptionComponent,
  PrefixComponent,
  SelectComponent,
  SelectPreviewComponent,
  SuffixComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/phone-number.config';

import { ATFlag, THFlag } from './flags';

@Component({
  standalone: true,
  selector: 'cck-phone-number',
  imports: [
    FormFieldComponent,
    LabelComponent,
    PrefixComponent,
    InputComponent,
    SelectComponent,
    OptionComponent,
    HintComponent,
    NgxMaskDirective,
    SuffixComponent,
    SvgIconComponent,
    SelectPreviewComponent,
  ],
  providers: [provideNgxMask()],
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss'],
})
export class PhoneNumberComponent {
  public cckExampleArgs = input.required<ExampleArgs>();

  protected value = signal<'TH' | 'AT'>('TH');

  protected THFlag = THFlag;
  protected ATFlag = ATFlag;
}
