import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  contentWrapper: {
    display: 'flex',
    gap: '16px',
  },

  docContent: {
    flexGrow: 1
  },

  sidebarNav: {
    width: '200px',
    flexShrink: 0,
  },

  docController: {
    columnGap: '32px',
    display: 'flex',
  },

  docDescription: {
    display: 'flex',
  },

  divider: {
    height: '1px',
    backgroundColor: '#e1dfdd',
    ...shorthands.border('0px', 'none'),
    ...shorthands.margin('48px', '0px'),
  },
});