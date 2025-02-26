import { history } from "./history";
import { Renderer } from "../renderer";

export function Router({ children }: { children: any[] }) {
  if (!Renderer.isListening) {
    history.listen(() => {
      const matchedRoute = children.find((child) => child.type === "Route" && child.props.path === history.location);
      
      Renderer.forceUpdate(matchedRoute.props.element());
    });

    Renderer.isListening = true;
  }

  const currentPath = history.location;

  const matchedRoute = children.find((child) => child.type === "Route" && child.props.path === currentPath);

  return matchedRoute ? matchedRoute.props.element() : null;
}
