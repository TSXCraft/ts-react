import { createElement, Fragment } from "@core/react";

export { createElement as jsx, createElement as jsxs, Fragment };

export namespace JSX {
  export interface Element {
    type: string | Function;
    props: Record<string, any>;
    key?: string | number | null;
  }

  export interface IntrinsicElements {
    div: { [key: string]: any };
    span: { [key: string]: any };
    button: { [key: string]: any };
    input: { [key: string]: any };
    p: { [key: string]: any };
    h1: { [key: string]: any };
    h2: { [key: string]: any };
    svg: { [key: string]: any };
    [key: string]: { [key: string]: any };
  }
}