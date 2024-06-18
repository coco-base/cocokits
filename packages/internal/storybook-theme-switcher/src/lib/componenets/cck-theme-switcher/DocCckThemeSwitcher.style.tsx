import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  selectThemeBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--size-6)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-alpha-default)',
    outline: 'none',
    padding: 'var(--size-5) var(--size-7) var(--size-5) var(--size-6)',
    cursor: 'pointer',
    font: 'var(--text-sm-medium)',
    borderRadius: 'var(--size-3)',
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