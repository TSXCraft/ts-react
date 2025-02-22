import { Node } from "./types";

export class Renderer {
  protected container: HTMLElement;
  protected currentNode: Node | null = null;
  protected nextNode: Node | null = null;

  constructor(container: HTMLElement | null) {
    if (!container) {
      throw new Error("Root not exists!");
    }

    this.container = container;
  }

  render(element: any) {
    this.nextNode = {
      type: "NODE",
      props: { children: [element] },
      dom: this.container,
      alternate: this.currentNode,
    };

    this.commitNode();
  }

  protected commitNode() {
    if (this.nextNode) {
      this.commitWork(this.nextNode);
      this.currentNode = this.nextNode;
    }
  }

  private commitWork(fiber: Node | null) {
    if (!fiber) {
      return;
    }
  
    let dom: HTMLElement | Text | undefined | null = fiber.dom;

    if (!dom) {
      if (fiber.type === "TEXT_ELEMENT") {
        dom = document.createTextNode(fiber.props.nodeValue);
      } else if (typeof fiber.type === "string") {
        dom = document.createElement(fiber.type);
      }

      fiber.dom = dom;
    }
  
    if (fiber.dom instanceof HTMLElement) {
      Object.keys(fiber.props)
        .filter((key) => key !== "children")
        .forEach((name) => {
          if (fiber.dom && fiber.dom instanceof HTMLElement && fiber.dom.getAttribute(name) !== fiber.props[name]) {
            fiber.dom.setAttribute(name, fiber.props[name]);
          }
        });
    }
  
    if (fiber.parent?.dom instanceof HTMLElement && fiber.dom) {
      if (!fiber.alternate) {
        fiber.parent.dom.appendChild(fiber.dom);
      }
    }
  
    let prevSibling: Node | null = null;
  
    if (fiber.dom instanceof HTMLElement) {
      fiber.props.children.forEach((child: any, index: number) => {
        const oldChild = fiber.alternate?.child;
    
        const newFiber: Node = {
          type: child.type,
          props: child.props,
          parent: fiber,
          dom: oldChild?.dom || null,
          alternate: oldChild || null,
        };
    
        if (index === 0) {
          fiber.child = newFiber;
        } else if (prevSibling) {
          prevSibling.sibling = newFiber;
        }
    
        prevSibling = newFiber;
      });
    }
  
    if (fiber.child) {
      this.commitWork(fiber.child);
    }

    if (fiber.sibling) {
      this.commitWork(fiber.sibling);
    }
  }
}
