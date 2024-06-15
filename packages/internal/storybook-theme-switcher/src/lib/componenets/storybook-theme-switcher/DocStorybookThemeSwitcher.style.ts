import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  iconButton: {
    width: '34px',
    height: '34px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    outline: 'none',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: '50%',
    transition: 'background-color 300ms, border-color 300ms',

    ':hover': {
      border: '1px solid rgba( 0, 0, 0 , 0.1)',
      backgroundColor: 'rgba( 0, 0, 0 , 0.08 )',
    },
  },
});
