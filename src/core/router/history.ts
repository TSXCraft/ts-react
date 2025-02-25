export function createBrowserHistory() {
  let listeners: Array<() => void> = [];

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  const history = {
    get location() {
      return window.location.pathname;
    },
    push(path: string) {
      if (window.location.pathname !== path) {
        window.history.pushState({}, "", path);

        notifyListeners();
      }
    },
    listen(listener: () => void) {
      listeners.push(listener);

      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
  };

  window.addEventListener("popstate", notifyListeners);

  return history;
}

export const history = createBrowserHistory();
