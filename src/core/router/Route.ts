import { history } from "./history";

export function Route({ path, element }: { path: string; element: any }) {
  return history.location === path ? element() : null;
}
