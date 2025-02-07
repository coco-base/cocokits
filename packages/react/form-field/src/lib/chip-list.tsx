/* eslint-disable max-lines-per-function */
'use client';
import { useEffect, useRef } from 'react';

import { hasNotValue } from '@cocokits/common-utils';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import Chip from './chip';
import { useFormStore } from './form-store';
import { useChipListStore } from './use-chip-list-store';

interface ChipListProps extends UIBaseComponentProps {
  /**
   * Sets the list of chips to be displayed in the component.
   * When this input is updated, the selection store is updated with the new chips.
   */
  chips?: string[];

  /** Determines whether a chip should be added when the input loses focus. */
  addOnBlur?: boolean;

  /** The placeholder text displayed in the input field. */
  placeholder?: string;

  /**
   * Disables the chip list, preventing user interaction.
   */
  disabled?: boolean;

  /** Calls, when the chip item that has been removed from the list. */
  onChipRemove?: (chip: string) => void;

  /** Calls, the chip item that has been added to the list. */
  onChipAdd?: (chip: string) => void;

  /** Calls, when the chip item that has been added to the list. */
  onChipsChange?: (chips: string[]) => void;
  
  className?: string;
  style?: React.CSSProperties;
}

export function ChipList(props: ChipListProps) {
  const formStore = useFormStore();
  const {chips, addChip, removeChip, setChips} = useChipListStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const separatorKeysCodes = ['Enter'];

  const formDisabled = formStore?.useState((state) => state.disabled);
  const formWrapperElement = formStore?.useState((state) => state.formFieldWrapperElem);
  const size = formStore?.useState((state) => state.size);

  const disabled = props.disabled ?? formDisabled;
  
  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'chipList',
    props,
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: !!props.className, classes: () => [props.className] },
    ]
  });

  useEffect(() => {
    if(!props.chips) {
      return;
    }
    setChips(props.chips);
  }, [props.chips]);

  // Register chipList into formSore 
  useEffect(() => {
    formStore?.deepUpdateComponent('chipList', {
      disabled: props.disabled,
      size: props.size,
    });
  }, [formStore, props.disabled, props.size]);

  // Unregister chipList into formSore 
  useEffect(() => {
    return () => {
      formStore?.unregisterComponent('chipList');
    };
  }, []);

  // Handle formFiled wrapper click, to focus on input
  useEffect(() => {
    const onFormFieldHostClick = () => {
      inputRef.current?.focus();
    };

    formWrapperElement?.addEventListener('click', onFormFieldHostClick);

    return () => {
      formWrapperElement?.removeEventListener('click', onFormFieldHostClick);
    };
  }, [formWrapperElement, inputRef.current]);

  
  const onInputKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim();
    if (!separatorKeysCodes.includes(e.key) || hasNotValue(value)) {
      return;
    }
    const newChipsState = addChip(value);
    if(newChipsState) {
      props.onChipAdd?.(value);
      props.onChipsChange?.(newChipsState);
    }
    e.currentTarget.value = '';
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim();

    if (!props.addOnBlur || hasNotValue(value)) {
      return;
    }
    const newChipsState = addChip(value);
    if(newChipsState) {
      props.onChipAdd?.(value);
      props.onChipsChange?.(newChipsState);
    }
    e.currentTarget.value = '';
  };

  const onRemoveChip = (chip: string) => {
    const newChipsState = removeChip(chip);
    if(newChipsState) {
      props.onChipRemove?.(chip);
      props.onChipsChange?.(newChipsState);
    }
  };

  return (
    <div className={hostClassNames} style={props.style}>
      {
        chips.map((chip, index) => (
          <Chip
            key={index}
            removable
            size={size}
            onRemove={() => onRemoveChip(chip)}>
            {chip}
          </Chip>
        ))
      }

      <input
        ref={inputRef}
        type="text"
        className={classNames.input}
        placeholder={props.placeholder}
        disabled={disabled}
        onKeyUp={onInputKeyup}
        onBlur={onInputBlur}
      />
    </div>
  );
}

ChipList.displayName = 'ChipList';
export default ChipList;