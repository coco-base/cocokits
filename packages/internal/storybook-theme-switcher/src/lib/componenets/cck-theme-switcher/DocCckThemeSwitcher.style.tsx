import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  selectThemeBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--size-12)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-alpha-default)',
    outline: 'none',
    padding: 'var(--size-8) var(--size-16) var(--size-8) var(--size-12)',
    cursor: 'pointer',
    font: 'var(--text-sm-medium)',
    borderRadius: 'var(--size-4)',
    color: 'var(--color-font-contrast-4)',
    transition: 'background-color 300ms, border-color 300ms',

    ':hover': {
      border: '1px solid var(--color-border-alpha-5)',
      backgroundColor: 'var(--color-bg-body-inverse-alpha-4)',
    },
  },

  arrowDownIcon: {
    fill: 'var(--color-font-contrast-2)',
  },
});