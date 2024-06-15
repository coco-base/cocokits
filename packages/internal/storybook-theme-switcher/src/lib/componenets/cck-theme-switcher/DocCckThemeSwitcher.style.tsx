import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  selectThemeBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    outline: 'none',
    padding: '8px 18px 8px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 300ms, border-color 300ms',

    ':hover': {
      border: '1px solid rgba( 0, 0, 0 , 0.2)',
      backgroundColor: 'rgba( 0, 0, 0 , 0.1 )'
    },
  }
});