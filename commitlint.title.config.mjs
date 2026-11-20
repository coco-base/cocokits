import base from './commitlint.config.mjs';

/** A PR title is a subject only (squash merges add the body), so it follows the commit rules without `body-empty`. */
export default {
  ...base,
  rules: { ...base.rules, 'body-empty': [0] },
};
