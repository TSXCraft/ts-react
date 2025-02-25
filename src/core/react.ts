export function createElement(type: any, props: any, ...children: any[]) {
  if (typeof type === "function") {
    return type({ ...props, children });
  }

  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "string"
          ? { type: "TEXT_ELEMENT", props: { nodeValue: child } }
          : child
      ),
    },
  };
}

export const Fragment = (props: { children: any }) => {
  return {
    type: "Fragment",
    props,
  }
};

const React = {
  createElement,
  Fragment,
};

export default React;