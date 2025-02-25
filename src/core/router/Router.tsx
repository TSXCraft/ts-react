import { history } from "./history";
import { Renderer } from "../renderer";

export function Router({ children }: { children?: any }) {
  let currentChildren = children.filter((c: any) => c !== null);
  
  if (!Renderer.isListening) {
    history.listen(() => {
      Renderer.forceUpdate();
    });
    
    Renderer.isListening = true;
  }

  return {
    type: "div",
    props: { children: currentChildren },
  };
}
