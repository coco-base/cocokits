import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    top: '64px',
    position: 'sticky',
    marginLeft: '40px',
  },
  heading: {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  ol: {
    position: 'relative',
    listStyleType: 'none',
    marginLeft: 0,
    marginTop: 0,
    paddingInlineStart: '20px',
    '& li': {
      marginBottom: '15px',
      lineHeight: '16px',
    },
    '& a': {
      textDecorationLine: 'none',
      color: '#201F1E',
      fontSize: '14px',
      ':hover': {
        color: '#201F1E',
      },
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      height: '100%',
      width: '3px',
      backgroundColor: '#EDEBE9',
      borderRadius: '4px'
    },
  },
  selected: {
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '-20px',
      top: 0,
      bottom: 0,
      width: '3px',
      backgroundColor: '#436DCD',
      borderRadius: '4px'
    },
  },
});