import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  selectThemeBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--cck-storybook-size-12)',
    backgroundColor: 'transparent',
    border: '1px solid var(--cck-storybook-color-border-alpha-default)',
    outline: 'none',
    padding: 'var(--cck-storybook-size-8) var(--cck-storybook-size-16) var(--cck-storybook-size-8) var(--cck-storybook-size-12)',
    cursor: 'pointer',
    font: 'var(--cck-storybook-text-sm-medium)',
    borderRadius: 'var(--cck-storybook-size-4)',
    color: 'var(--cck-storybook-color-font-contrast-4)',
    transition: 'background-color 300ms, border-color 300ms',

    ':hover': {
      border: '1px solid var(--cck-storybook-color-border-alpha-5)',
      backgroundColor: 'var(--cck-storybook-color-bg-body-inverse-alpha-4)',
    },
  },

  arrowDownIcon: {
    fill: 'var(--cck-storybook-color-font-contrast-2)',
  },
});