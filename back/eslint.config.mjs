// @ts-check

import eslint from '@eslint/js';
import { globalIgnores } from "eslint/config";
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  globalIgnores(["./dist/*"]),
  {
  
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  }
}
);