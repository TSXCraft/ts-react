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
      if (window.location.pathname === path) {
        return;
      }
      
      window.history.pushState({}, "", path);

      notifyListeners();
    },
    listen(listener: () => void) {
      listeners.push(listener);

      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
  };

  window.addEventListener("popstate", notifyListeners);

  window.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    
    if (target instanceof HTMLAnchorElement  && target.tagName === "A" && target.href.startsWith(window.location.origin)) {
      e.preventDefault();

      history.push(target.pathname);
    }
  });

  return history;
}

export const history = createBrowserHistory();
