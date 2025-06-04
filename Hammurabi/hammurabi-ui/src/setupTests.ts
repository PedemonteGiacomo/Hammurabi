// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Vitest runs in a Node environment where Webpack's `require.context`
// doesn't exist. Polyfill a minimal stub so hooks relying on it don't
// throw errors during tests.
if (typeof (require as any).context === 'undefined') {
  (require as any).context = () => {
    const fn = () => ({});
    fn.keys = () => [] as string[];
    return fn;
  };
}
