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

  private createDomElement(fiber: Node) {
    let dom: HTMLElement | Text | undefined | null = fiber.dom;

    if (!dom) {
      if (fiber.type === "TEXT_ELEMENT") {
        dom = document.createTextNode(fiber.props.nodeValue);
      } else if (typeof fiber.type === "string") {
        dom = document.createElement(fiber.type);
      }
    }

    return dom;
  }

  private checkProps(fiber: Node) {
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

  private appendNewNode(fiber: Node) {
    if (fiber.parent?.dom instanceof HTMLElement && fiber.dom) {
      if (!fiber.alternate) {
        fiber.parent.dom.appendChild(fiber.dom);
      }
    }
  }

  private updateFiberNode(fiber: Node) {
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
  }

  private commitWork(fiber: Node | null) {
    if (!fiber) {
      return;
    }

    // 파이버 노드에 맞는 element 생성
    fiber.dom = this.createDomElement(fiber);
  
    // 변경된 attribute만 체크 후 갱신
    this.checkProps(fiber);
  
    // 새로 생성된 노드의 경우 부모 밑에 추가
    this.appendNewNode(fiber);
  
    // 기존 alternate가 없을 경우에만 새로 생성한 노드로 갱신
    this.updateFiberNode(fiber);
  
    if (fiber.child) {
      this.commitWork(fiber.child);
    }

    if (fiber.sibling) {
      this.commitWork(fiber.sibling);
    }
  }
}
