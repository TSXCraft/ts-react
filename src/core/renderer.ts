import { FiberNode } from "./types";

export class Renderer {
  protected container: HTMLElement;
  protected currentNode: FiberNode | null = null;
  protected nextNode: FiberNode | null = null;

  private static instance: Renderer | null = null;
  static isListening = false;

  constructor(container: HTMLElement | null) {
    if (!container) {
      throw new Error("Root not exists!");
    }

    this.container = container;
    Renderer.instance = this;
  }

  static forceUpdate(element: FiberNode) {
    requestAnimationFrame(() => {
      if (!Renderer.instance) {
        return;
      }

      Renderer.instance.render(element);
    })
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

  private createDomElement(fiber: FiberNode) {
    let dom: HTMLElement | Text | null | undefined = fiber.dom;
  
    if (dom) {
      if (fiber.type === "ROOT") {
        return dom;
      }

      if (fiber.type === "TEXT_ELEMENT") {
        if (!(dom instanceof Text)) {
          dom = document.createTextNode(fiber.props.nodeValue);
        }
      } else if (typeof fiber.type === "string") {
        if (!(dom instanceof HTMLElement) || dom.nodeName.toLowerCase() !== fiber.type.toLocaleLowerCase()) {
          dom = document.createElement(fiber.type);
        }
      }
    } else {
      if (fiber.type === "TEXT_ELEMENT") {
        dom = document.createTextNode(fiber.props.nodeValue);
      } else if (typeof fiber.type === "string") {
        dom = document.createElement(fiber.type);
      }
    }
    
    return dom;
  }
  

  private checkProps(fiber: FiberNode) {
    if (fiber.dom instanceof HTMLElement) {
      Object.keys(fiber.props)
        .filter((key) => key !== "children")
        .forEach((name) => {
          if (fiber.dom && fiber.dom instanceof HTMLElement && fiber.dom.getAttribute(name) !== fiber.props[name]) {
            fiber.dom.setAttribute(name, fiber.props[name]);
          }
        });
    }
  }

  private appendNewNode(fiber: FiberNode) {
    if (!fiber.parent || !fiber.parent.dom || !fiber.dom) return;
  
    const parentDom = fiber.parent.dom;
    const existingDom = fiber.alternate?.dom;
  
    if (!existingDom) {
      parentDom.appendChild(fiber.dom);

      return;
    }
  
    if (fiber.dom instanceof Text && existingDom instanceof Text) {
      if (fiber.props.nodeValue !== existingDom.nodeValue) {
        existingDom.nodeValue = fiber.props.nodeValue;
      }

      fiber.dom = existingDom;

      return;
    }
  
    if (fiber.dom instanceof HTMLElement && existingDom instanceof HTMLElement) {
      if (fiber.dom.tagName !== existingDom.tagName) {
        while (existingDom.firstChild) {
          fiber.dom.appendChild(existingDom.firstChild);
        }
        
        parentDom.replaceChild(fiber.dom, existingDom);
      } else {
        fiber.dom = existingDom;
      }
      return;
    }

    parentDom.replaceChild(fiber.dom, existingDom);
  }

  private deleteFiberNode(fiber: FiberNode) {
    if (!fiber.dom || !fiber.parent?.dom) return;
  
    fiber.parent.dom.removeChild(fiber.dom);
  
    fiber.dom = null;
    fiber.alternate = null;
    fiber.child = null;
    fiber.sibling = null;
  }
  

  private updateFiberNode(fiber: FiberNode) {
    let prevSibling: FiberNode | null = null;
    let oldChild = fiber.alternate?.child;
    let lastOldChild = oldChild;

    fiber.props.children?.forEach((child: any, index: number) => {
      if (!child || typeof child !== "object") return;
  
      const newFiber: FiberNode = {
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
      lastOldChild = oldChild;
      oldChild = oldChild?.sibling;
    });

    while (oldChild) {
      const nextOldChild = oldChild.sibling;

      this.deleteFiberNode(oldChild);

      oldChild = nextOldChild;
    }
  }

  private handleFragment(fiber: FiberNode) {
    let parent = fiber.parent;

    while (parent?.type && parent.type === 'Fragment') {
      parent = parent.parent;
    }

    if (fiber?.props?.children) {
      fiber.props.children.forEach((child: FiberNode) => {
        child.parent = parent;

        this.commitWork(child);
      })
    }

    if (fiber.sibling) {
      this.commitWork(fiber.sibling);
    }
  }

  private commitWork(fiber: FiberNode | null) {
    if (!fiber) {
      return;
    }
    
    if (fiber.type === "Fragment") {
      this.handleFragment(fiber);

      return;
    }

    fiber.dom = this.createDomElement(fiber);

    this.checkProps(fiber);
    this.appendNewNode(fiber);
    this.updateFiberNode(fiber);
  
    if (fiber.child) {
      this.commitWork(fiber.child);
    }

    if (fiber.sibling) {
      this.commitWork(fiber.sibling);
    }
  }
}
