import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  wrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',

    zIndex: 10,
    perspective: '1000px',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    pointerEvents: 'none',
    touchAction: 'none',

    transition: 'opacity 200ms'
  },

  content: {
    pointerEvents: 'initial',
    touchAction: 'initial',

    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 1)',

    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
    transition: 'opacity 500ms, transform 300ms',
  },

  backdrop: {
    pointerEvents: 'initial',
    touchAction: 'initial',

    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: '#000',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 300ms',
  }
});