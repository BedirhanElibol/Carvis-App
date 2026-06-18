// ================================================
// VITEST TEST SETUP
// ================================================ import '@testing-library/jest-dom'; // Mock window.matchMedia (for responsive hooks)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
}); // Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
Object.defineProperty(window, "localStorage", { value: localStorageMock }); // Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock; // Suppress console.error in tests (optional)
// const originalError = console.error;
// beforeAll(() => {
// console.error = (...args) => {
// if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
// originalError.call(console, ...args);
// };
// });
// afterAll(() => { console.error = originalError; });
