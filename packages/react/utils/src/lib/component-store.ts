import { useLayoutEffect, useRef, useState } from 'react';

export type ComponentStoreSelector<T, U> = (state: T) => U;

export interface ComponentStore<T extends object> {
  useStore: <U>(selector: ComponentStoreSelector<T, U>) => U;
  getState: () => T;
  updateState: (partial: Partial<T> | ((prevState: T) => Partial<T>)) => void;
  setState: (state: T) => void;
}

export function createComponentStore<T extends object>(initialState: T) {
  let state = initialState;
  const listeners = new Set<(state: T) => void>();

  const updateState = (partial: Partial<T> | ((prevState: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };

    listeners.forEach((listener) => listener(state));
  };

  const setState = (newState: T) => {
    state = { ...newState };
    listeners.forEach((listener) => listener(state));
  };

  const _useState = <U>(selector: ComponentStoreSelector<T, U>) => {
    const [selectedState, setSelectedState] = useState(() => selector(state));
    const selectedStateRef = useRef(selectedState);

    useLayoutEffect(() => {
      const listener = (newState: T) => {
        const newSelectedState = selector(newState);

        if (selectedStateRef.current !== newSelectedState) {
          selectedStateRef.current = newSelectedState;
          setSelectedState(newSelectedState);
        }
      };

      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);

    return selectedState;
  };

  const getState = () => state;

  const createSelector = <U>(selector: ComponentStoreSelector<T, U>) => {
    return _useState.bind(null, selector) as () => U;
  };

  return { useState: _useState, getState, updateState, setState, createSelector, listeners };
}
