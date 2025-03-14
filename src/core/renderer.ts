import { FiberNode } from "./types";

export class Renderer {
  protected container: HTMLElement;
  protected currentFiberTree: FiberNode | null = null;
  protected workingInFiberTree: FiberNode | null = null;

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
    });
  }

  render(element: any) {
    if (this.currentFiberTree) {
      this.currentFiberTree.alternate = null;

      this.workingInFiberTree = {
        ...this.currentFiberTree,
        props: { children: [element] },
        alternate: this.currentFiberTree
      }
    } else {
      this.workingInFiberTree = {
        type: "ROOT",
        props: { children: [element] },
        dom: this.container,
        alternate: null,
      };
    }
    
    this.workLoop();
  }

  private workLoop() {
    this.renderFiberTree();
    this.commitFiberTree();

    this.currentFiberTree = this.workingInFiberTree;
  }

  private renderFiberTree() {
    if (!this.workingInFiberTree) {
      return;
    }

    let fiber: FiberNode | null = this.workingInFiberTree;
  
    while (fiber) {
      fiber = this.reconcile(fiber);
    }
  }

  private reconcile(fiber: FiberNode) {
    this.createDomElement(fiber);
    this.checkProps(fiber);
    this.updateFiberNode(fiber);

    if (fiber.child) {
      return fiber.child
    }

    let nextFiber: FiberNode | null = fiber;

    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }

      nextFiber = nextFiber.parent ?? null;
    }

    return null;
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

    fiber.dom = dom;
  }

  private checkProps(fiber: FiberNode) {
    fiber.props.checkedProps = {};
  
    if (fiber.type === "TEXT_ELEMENT") {
      fiber.props.checkedProps.nodeValue = fiber.props.nodeValue;

      return;
    }
  
    Object.keys(fiber.props)
      .filter((key) => key !== "children")
      .forEach((name) => {
        fiber.props.checkedProps[name] = fiber.props[name];
      });
  }

  private updateFiberNode(fiber: FiberNode) {
    let prevSibling: FiberNode | null = null;
    let oldChild = fiber.alternate?.child;

    fiber.props.children?.forEach((child: any, index: number) => {
      if (!child || typeof child !== "object") {
        return;
      }

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

      if (oldChild) {
        oldChild.alternate = null;
      }

      prevSibling = newFiber;
      oldChild = oldChild?.sibling;
    });

    while (oldChild) {
      const nextOldChild = oldChild.sibling;
      this.deleteFiberNode(oldChild);
      oldChild = nextOldChild;
    }
  }

  private deleteFiberNode(fiber: FiberNode) {
    if (!fiber.dom || !fiber.parent?.dom) {
      return;
    }

    if (fiber.dom && fiber.parent?.dom && fiber.parent.dom.contains(fiber.dom)) {
      fiber.parent.dom.removeChild(fiber.dom);
    }

    fiber.dom = null;
    fiber.alternate = null;
    fiber.child = null;
    fiber.sibling = null;
  }

  private commitFiberTree() {
    if (this.workingInFiberTree) {
      this.commitWork(this.workingInFiberTree);
      this.currentFiberTree = this.workingInFiberTree;
    }
  }

  private commitWork(fiber: FiberNode | null) {
    if (!fiber) {
      return;
    }
    
    this.applyProps(fiber);
    this.appendNewNode(fiber);

    if (fiber.child) {
      
      this.commitWork(fiber.child);
    }

    if (fiber.sibling) {
      this.commitWork(fiber.sibling);
    }
  }

  private applyProps(fiber: FiberNode) {
    const currentDom = fiber.dom;

    if (currentDom instanceof HTMLElement) {
      Object.keys(fiber.props.checkedProps || {}).forEach((name) => {
        const value = fiber.props.checkedProps[name];

        if (currentDom.getAttribute(name) !== String(value)) {
          currentDom.setAttribute(name, String(value));
        }

        currentDom.removeAttribute('checkedprops');
      });
    } else if (currentDom instanceof Text) {
      if (fiber.props.nodeValue !== currentDom.nodeValue) {
        currentDom.nodeValue = fiber.props.nodeValue;
      }
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
}
