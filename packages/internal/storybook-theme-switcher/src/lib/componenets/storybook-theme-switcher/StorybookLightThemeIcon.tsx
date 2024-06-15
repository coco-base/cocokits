import React from 'react';

import { useStyles } from './StorybookThemeIcon.style';
import { mergeClasses } from '@griffel/react';

interface StorybookLightThemeIconProps {
  size?: 'small';
  selected?: boolean;
}


export const StorybookLightThemeIcon = ({ size, selected }: StorybookLightThemeIconProps) => {
  const styles = useStyles();
  return (
    <svg
      className={mergeClasses(
        styles.dark,
        size === 'small' && styles.smallSize,
        selected && styles.selected
      )}
      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 1C12.5523 1 13 1.44772 13 2V3C13 3.55228 12.5523 4 12 4C11.4477 4 11 3.55228 11 3V2C11 1.44772 11.4477 1 12 1Z"></path>
      <path
        d="M12 20C12.5523 20 13 20.4477 13 21V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V21C11 20.4477 11.4477 20 12 20Z"></path>
      <path
        d="M5.63582 4.22185C5.24529 3.83132 4.61213 3.83132 4.2216 4.22185C3.83108 4.61237 3.83108 5.24554 4.2216 5.63606L4.92871 6.34317C5.31924 6.73369 5.9524 6.73369 6.34292 6.34317C6.73345 5.95264 6.73345 5.31948 6.34292 4.92896L5.63582 4.22185Z"></path>
      <path
        d="M17.6567 17.6569C18.0472 17.2664 18.6804 17.2664 19.0709 17.6569L19.778 18.364C20.1685 18.7545 20.1685 19.3877 19.778 19.7782C19.3875 20.1688 18.7543 20.1688 18.3638 19.7782L17.6567 19.0711C17.2661 18.6806 17.2661 18.0474 17.6567 17.6569Z"></path>
      <path
        d="M19.7779 5.63606C20.1684 5.24554 20.1684 4.61237 19.7779 4.22185C19.3874 3.83132 18.7542 3.83132 18.3637 4.22185L17.6566 4.92896C17.2661 5.31948 17.2661 5.95264 17.6566 6.34317C18.0471 6.73369 18.6803 6.73369 19.0708 6.34317L19.7779 5.63606Z"></path>
      <path
        d="M6.34285 19.0711L5.63574 19.7782C5.24522 20.1688 4.61205 20.1688 4.22153 19.7782C3.831 19.3877 3.831 18.7545 4.22153 18.364L4.92864 17.6569C5.31916 17.2664 5.95232 17.2664 6.34285 17.6569C6.73337 18.0474 6.73337 18.6806 6.34285 19.0711Z"></path>
      <path
        d="M2 11C1.44772 11 1 11.4477 1 12C1 12.5523 1.44772 13 2 13H3C3.55228 13 4 12.5523 4 12C4 11.4477 3.55228 11 3 11H2Z"></path>
      <path
        d="M20 12C20 11.4477 20.4477 11 21 11H22C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H21C20.4477 13 20 12.5523 20 12Z"></path>
      <path
        d="M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z"></path>
    </svg>
  );
};
