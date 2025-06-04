// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Vitest doesn't provide Webpack's `require.context` which the app relies on
// for component discovery. Provide a simple stub so tests don't crash.
if (typeof (require as any).context === 'undefined') {
  (require as any).context = () => {
    const fn = () => ({});
    fn.keys = () => [] as string[];
    return fn;
  };
}
