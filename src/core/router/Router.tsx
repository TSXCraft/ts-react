import { history } from "./history";
import { Renderer } from "../renderer";

interface RouterProps {
  children?: any;
}

export function Router({ children }: RouterProps) {
  if (!Renderer.isListening) {
    history.listen(() => {
      const matchedRoute = (Array.isArray(children) ? children : [children])
        .find((child) => child.type === "Route" && child.props.path === history.location);

      if (matchedRoute) {
        Renderer.forceUpdate(matchedRoute.props.element());
      }
    });

    Renderer.isListening = true;
  }

  const currentPath = history.location;
  
  const matchedRoute = (Array.isArray(children) ? children : [children])
    .find((child) => child.type === "Route" && child.props.path === currentPath);

  return matchedRoute ? matchedRoute.props.element() : null;
}