import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { fromAttrByNameToBoolean, fromControl } from '@cocokits/angular-utils';
import { autoResizeTextarea } from '@cocokits/common-utils';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  standalone: true,
  imports: [],
  selector: 'textarea[cck-textarea], textarea[cckTextarea]',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
    '[disabled]': 'store.state.disabled()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class TextareaComponent extends _UiBaseComponent<'textarea'> implements OnInit {
  protected readonly componentName = 'textarea';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.store.state.disabled(), classes: this.classNames().disabled },
    { if: this.autoResize(), classes: this.classNames().autoResize },
  ]);

  protected store = injectFormFieldStore();
  private ngControl = inject(NgControl, { optional: true, self: true });
  private destroyRef = inject(DestroyRef);
  private elemRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  private required = fromAttrByNameToBoolean('required');
  private focused = signal(false);

  /**
   * Whether autoResize is enabled or not
   */
  public autoResize = input<boolean>(false);

  /**
   * Minimum amount of rows in the textarea. Will be skipped when the `autoResize` is false
   */
  public minRows = input<number>(2);

  /**
   * Maximum amount of rows in the textarea. Will be skipped when the `autoResize` is false
   */
  public maxRows = input<number>(5);

  /**
   * Whether the textarea is disabled.
   */
  public disabled = fromAttrByNameToBoolean('disabled');

  private __onAutoResizeChanged = effect((onCleanup) => {
    if (this.autoResize()) {
      const { destroy, update } = autoResizeTextarea(this.elemRef.nativeElement, this.minRows(), this.maxRows());
      this.autoResizeUpdate = update;
      onCleanup(() => destroy());
    }
  });

  constructor() {
    super();
    this.baseClassOptions.skipType = true;
  }

  /**
   * Update the size textarea base on the content.
   */
  private autoResizeUpdate: () => void = () => {
    throw new Error(`'autoResize' for textarea is no enabled or it has not initialized jet`);
  };

  ngOnInit() {
    this.store.textarea.disabled = this.disabled;
    this.store.textarea.required = this.required;
    this.store.textarea.focused = this.focused;

    if (this.ngControl?.control) {
      this.store.textarea.control = fromControl(this.ngControl.control, { destroyRef: this.destroyRef });
    }
  }

  protected onFocus() {
    this.focused.set(true);
  }

  protected onBlur() {
    this.focused.set(false);
  }
}
