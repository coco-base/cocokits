import { UIBaseComponentProps } from '@cocokits/core';

export interface RadioChangeEvent<T extends string | number> {
  value: T;
}

export interface RadioButtonProps<T extends string | number> extends UIBaseComponentProps {
  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  name?: string; // computed(() => this._name() || this.radioGroup?.name());

  /** Whether this radio button is checked. */
  checked?: boolean; // computed(() => (this.radioGroup ? this.radioGroup.selected() === this.value() : this._checked()));

  /** The value of this radio button. */
  value: T;

  /** Whether the radio button is disabled. */
  disabled?: boolean; // computed(() => this._disabled() ?? this.radioGroup?.disabled());

  /** The unique ID for the radio button. If none is supplied, it will be auto-generated. */
  id?: string; // input(`cck-radio-${NEXT_ID++}`);

  /**
   * Event emitted when the group value changes.
   * Change events are only emitted when the value changes due to user interaction with
   * a radio button (the same behavior as `<input type-"radio">`).
   */
  onChange?: (event: RadioChangeEvent<T>) => void;

  className?: string;
  children?: React.ReactNode;
}

export interface RadioGroupProps<T extends string | number> extends UIBaseComponentProps {
  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  name?: string; // Default: (`cck-radio-group-${NEXT_ID++}`);

  /** The currently selected radio button */
  selected?: T;

  /**
   * Whether the radio group is disabled
   * @storybook argType will be overridden by storybook
   */
  disabled?: boolean;

  /**
   * Event emitted when the group value changes.
   * Change events are only emitted when the value changes due to user interaction with
   * a radio button (the same behavior as `<input type-"radio">`).
   */
  onChange?: (event: RadioChangeEvent<T>) => void;

  className?: string;

  children?: React.ReactNode;
}
