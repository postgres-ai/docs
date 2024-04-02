export {}

declare global {
  interface Window {
    Intercom?(action: 'show'): void
    twttr: {
      widgets: {
        load: (elem?: HTMLElement) => void;
      }
    }
  }
}
