type Routes = {
  path: string;
  component: () => HTMLElement;
};

type Router = {
  addRoute: (path: string, component: () => HTMLElement) => void;
  notFound: (component: () => HTMLElement) => Router;
  start: () => void;
};

export function createRouter() {
  const routes: Routes[] = [];
  let notFound = () => {};

  const router: Router = {
    addRoute: (path, component) => {
      routes.push({
        path,
        component,
      });
    },

    notFound: (component) => {
      notFound = component;
      return router;
    },

    start: () => {
      window.addEventListener("hashchange", checkRoutes);

      if (!window.location.hash) {
        window.location.hash = "#";
      }

      checkRoutes();
    },
  };

  function checkRoutes() {
    const currentRoute = routes.find(
      (route) => route.path === window.location.hash,
    );

    if (!currentRoute) {
      notFound();
      return;
    }

    currentRoute.component();
  }

  return router;
}
