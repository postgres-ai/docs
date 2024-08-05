export {}

declare global {
  interface Window {
    twttr: {
      widgets: {
        load: (elem?: HTMLElement) => void;
      }
    }
  }
}
