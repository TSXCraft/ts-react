export type FiberNode = {
  type: string;
  props: Record<string, any>;
  dom?: HTMLElement | Text | undefined | null;
  child?: FiberNode | null;
  sibling?: FiberNode | null;
  parent?: FiberNode;
  alternate?: FiberNode | null;
};