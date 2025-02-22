import React from '@core/react';

import { createRoot } from "@core";

const ChildComponent = () => {
  return (
    <div style="background-color: aqua">
      <p>Test Child</p>
    </div>
  )
}

const App = () => (
  <div>
    <h1>Test Parent</h1>
    <ChildComponent />
  </div>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);