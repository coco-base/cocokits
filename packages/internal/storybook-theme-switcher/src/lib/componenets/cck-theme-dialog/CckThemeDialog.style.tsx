import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  wrapper: {
    padding: '24px 48px',
    display: 'flex',
    flexDirection: 'column'
  },
  toolbar: {
    display: 'flex'
  },
  toolbarCloseBtn: {
    marginLeft: 'auto'
  },
  themeWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px'
  },
  themeItem: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    padding: '12px',
    cursor: 'pointer'
  },
  themeItemSelected: {
    border: '1px solid blue',
  },
  themeIcon: {
    width: '48px',
    height: '48px',
  },
  themeName: {
    fontSize: '18px'
  },
  collectionsSelection: {
    display: 'flex',
    flexDirection: 'column'
  },
  collectionWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  collectionName: {
    fontSize: '14px'
  },
  collectionModeWrapper: {
    display: 'flex',
    gap: '12px'
  },
  footer: {
    display: 'flex'
  },
  footerSaveBtn: {
    marginLeft: 'auto'
  }
});