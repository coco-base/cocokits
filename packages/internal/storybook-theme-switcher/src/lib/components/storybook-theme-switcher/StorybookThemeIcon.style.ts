import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  smallSize: {
    width: '18px',
    height: '18px',
  },
  dark: {
    width: '100%',
    height: '100%',
    padding: '1px', // To make look like same as light icon size
    fill: 'rgb(148, 151, 158)',
  },
  light: {
    width: '100%',
    height: '100%',
    fill: 'rgb(148, 151, 158)',
  },
  selected: {
    fill: 'blue',
  },
});
