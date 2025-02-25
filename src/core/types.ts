export type Node = {
  type: string;
  props: Record<string, any>;
  dom?: DocumentFragment | HTMLElement | Text | undefined | null;
  child?: Node;
  sibling?: Node;
  parent?: Node;
  alternate?: Node | null;
};