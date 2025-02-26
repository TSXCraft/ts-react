export function Route({ path, element }: { path: string; element: any }) {
  return { type: "Route", props: { path, element } };
}
