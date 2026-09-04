// scripts/ts6-compat.cjs
/**
 * TypeScript 7.0 Coexistence Compatibility Bridge for ESLint
 * TypeScript 7.0 uses a native Go binary for tsc and does not ship with the JS Programmatic Compiler API.
 * This bridge seamlessly provides the official @typescript/typescript6 compiler API
 * to @typescript-eslint when running ESLint.
 */
try {
  const ts6 = require('@typescript/typescript6');
  const tsPath = require.resolve('typescript');
  require.cache[tsPath] = {
    id: tsPath,
    filename: tsPath,
    loaded: true,
    exports: ts6,
  };
} catch (e) {
  // If @typescript/typescript6 is not available, proceed with default resolution
}
