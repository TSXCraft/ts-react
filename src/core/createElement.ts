// createElement.ts
type Props = Record<string, any>;

function createTextElement(text: string | number) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(
  type: string | Function,
  props: Props | null,
  ...children: any[]
) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "string" || typeof child === "number"
          ? createTextElement(child)
          : child,
      ),
    },
  };
}

const React = {
  createElement,
};

export default React;
