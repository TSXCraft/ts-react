import { createElement } from "../react";
import { history } from "./history";

export function Link({ to, children }: { to: string; children: any }) {
  return createElement("a", {
    href: to,
    onclick: (event: Event) => {
      event.preventDefault();
      history.push(to);
    },
    children,
  });
}
