import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { autoResizeTextarea, toBooleanOrPresent, toNumber } from '@cocokits/common-utils';

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
export class TextareaComponent extends _UiBaseComponent<'textarea'> implements OnInit, OnDestroy {
  protected readonly componentName = 'textarea';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.store.state.disabled(), classes: this.classNames().disabled },
    { if: this.autoResize(), classes: this.classNames().autoResize },
  ]);

  private cd = inject(ChangeDetectorRef);
  protected store = injectFormFieldStore();
  private ngControl = inject(NgControl, { optional: true, self: true });
  private elemRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  public _focused = signal(false);

  /**
   * Whether textarea is required.
   * @storybook argType will be overridden by storybook
   */
  public _required = input(undefined, { transform: toBooleanOrPresent, alias: 'required' });

  /**
   * Whether autoResize is enabled or not
   */
  public autoResize: InputSignal<boolean> = input<boolean>(false);

  /**
   * Minimum amount of rows in the textarea. Will be skipped when the `autoResize` is false
   */
  public minRows = input(2, { transform: toNumber });

  /**
   * Maximum amount of rows in the textarea. Will be skipped when the `autoResize` is false
   */
  public maxRows = input(5, { transform: toNumber });

  /**
   * Whether the textarea is disabled.
   * @storybook argType will be overridden by storybook
   */
  public disabled = input(undefined, { transform: toBooleanOrPresent });

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
    this.store.registerComponent('textarea', this, this.cd);
  }

  /**
   * Update the size textarea base on the content.
   * Will be override after initialized on component on '__onAutoResizeChanged'
   */
  private autoResizeUpdate: () => void = () => {
    throw new Error(`'autoResize' for textarea is no enabled or it has not initialized jet`);
  };

  ngOnInit() {
    if (this.ngControl?.control) {
      this.store.setController(this.ngControl.control);
    }
  }

  protected onFocus() {
    this._focused.set(true);
  }

  protected onBlur() {
    this._focused.set(false);
  }

  ngOnDestroy() {
    this.store.unregisterComponent(this, this.cd);
  }
}
