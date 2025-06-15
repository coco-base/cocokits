const sharedHead = `
  <link rel="shortcut icon" href="/favicon/favicon.ico" />

  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
`;

const managerHead = `
  ${sharedHead}
  <link rel="stylesheet" href="/styles/manager-styles.min.css">
`;

const previewHead = `
  ${sharedHead}
  <link rel="stylesheet" href="/styles/preview-styles.min.css">
  <link rel="stylesheet" href="/styles/cck-themes-components.min.css">
  <link rel="stylesheet" href="/styles/cck-themes-tokens.min.css">
`;

export default {
  managerEntries: [require.resolve('./src/lib/manager/manager.ts')],
  previewAnnotations: [require.resolve('./src/lib/preview/preview.ts')],
  managerHead: (head: string) => `${head} ${managerHead}`,
  previewHead: (head: string) => `${head} ${previewHead}`,
  staticDirs: [`${__dirname}/src/assets`],
  parameters: {},
  docs: { defaultName: 'Docs' },
};
