if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
}
