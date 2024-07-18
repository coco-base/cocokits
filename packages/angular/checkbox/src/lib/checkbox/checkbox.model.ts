import { CheckboxComponent } from './checkbox.component';

export interface CheckboxChange {
  /** The source checkbox of the event. */
  source: CheckboxComponent;

  /** The new `checked` value of the checkbox. */
  checked: boolean;
}
