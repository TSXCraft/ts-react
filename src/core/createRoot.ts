import { Renderer } from './renderer';

class RootRenderer extends Renderer {
  constructor(container: HTMLElement | null) {
    super(container);
  }

  render(element: any) {
    this.nextNode = {
      type: "ROOT",
      props: { children: [element] },
      dom: this.container,
      alternate: this.currentNode,
    };

    this.commitNode();
  }
}

export function createRoot(container: HTMLElement | null) {
  return new RootRenderer(container);
}