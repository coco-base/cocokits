import reactHooks from 'eslint-plugin-react-hooks';
import baseConfig from '../../eslint.config.mjs';

export default [{ ignores: ['core/**'] }, ...baseConfig, reactHooks.configs.flat.recommended];
