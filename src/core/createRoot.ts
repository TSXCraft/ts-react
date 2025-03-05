import { Renderer } from './renderer';

export function createRoot(container: HTMLElement | null) {
  return new Renderer(container);
}