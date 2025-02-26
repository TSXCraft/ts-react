type Fiber = {
  type: string | Function;
  props: Record<string, any>;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  dom: HTMLElement | Text | null;
  alternate: Fiber | null;
};

export class Render {
  protected container: HTMLElement | null = null;
  protected currentFiber: Fiber | null = null;
  protected nextFiber: Fiber | null = null;
  protected workInProgress: Fiber | null = null;

  constructor(container: HTMLElement | null) {
    if (!container) {
      throw new Error("Container is required");
    }

    this.container = container;
  }

  render(element: Fiber) {
    this.nextFiber = {
      type: "ROOT",
      dom: this.container,
      props: {
        children: [element],
      },
      child: null,
      sibling: null,
      return: null,
      alternate: this.currentFiber,
    };

    this.workInProgress = this.nextFiber;
    this.workLoop();
  }

  private workLoop() {
    while (this.workInProgress) {
      this.workInProgress = this.performUnitOfWork(this.workInProgress);
    }

    // 모든 작업이 완료되면 커밋
    if (this.nextFiber) {
      this.commitRoot();
    }
  }

  private commitRoot() {
    if (this.nextFiber) {
      this.commitWork(this.nextFiber.child);
    }
    this.currentFiber = this.nextFiber;
    this.nextFiber = null;
  }

  private createElement(fiber: Fiber) {
    if (!fiber.dom) {
      if (fiber.type === "TEXT_ELEMENT") {
        fiber.dom = document.createTextNode(fiber.props.nodeValue);
      } else if (typeof fiber.type === "string") {
        fiber.dom = document.createElement(fiber.type);
      }
    }
  }

  private updateProps(dom: HTMLElement | Text, props: Record<string, any>) {
    if (!(dom instanceof HTMLElement)) {
      return;
    }

    Object.keys(props)
      .filter((key) => key !== "children")
      .forEach((name) => {
        dom.setAttribute(name, props[name]);
      });
  }

  private reconcileChildren(wipFiber: Fiber, elements: any[]) {
    let prevSibling: Fiber | null = null;

    elements.forEach((element, index) => {
      const newFiber: Fiber = {
        type: element.type,
        props: element.props,
        return: wipFiber,
        alternate: null,
        dom: null,
        child: null,
        sibling: null,
      };

      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (prevSibling) {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    });
  }

  private performUnitOfWork(fiber: Fiber | null) {
    if (!fiber) {
      return null;
    }

    // 함수형 컴포넌트 실행
    if (typeof fiber.type === "function") {
      const children = [(fiber.type as Function)(fiber.props)];
      this.reconcileChildren(fiber, children);
    } else {
      // DOM 노드 생성
      this.createElement(fiber);
      // 자식 요소들 재조정
      this.reconcileChildren(fiber, fiber.props.children || []);
    }

    // 다음 작업 단위 찾기
    if (fiber.child) {
      return fiber.child;
    }
    let nextFiber: Fiber | null = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.return;
    }
    return null;
  }

  private commitWork(fiber: Fiber | null) {
    if (!fiber) {
      return;
    }

    if (typeof fiber.type === "function") {
      this.commitWork(fiber.child);
      this.commitWork(fiber.sibling);
      return;
    }

    // DOM 요소 설정
    this.createElement(fiber);

    // 부모 DOM 찾기
    let parentFiber = fiber.return;
    while (parentFiber && !parentFiber.dom) {
      parentFiber = parentFiber.return;
    }

    // DOM 추가
    if (fiber.dom && parentFiber?.dom) {
      parentFiber.dom.appendChild(fiber.dom);
    }

    // props 업데이트 - TEXT_ELEMENT가 아닐 때만
    if (
      fiber.dom &&
      typeof fiber.type === "string" &&
      fiber.type !== "TEXT_ELEMENT"
    ) {
      this.updateProps(fiber.dom, fiber.props);
    }

    this.commitWork(fiber.child);
    this.commitWork(fiber.sibling);
  }
}
