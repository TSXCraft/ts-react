import React from "./core/createElement";
import { Render } from "./core/render";
import App from "./App";

const container = document.getElementById("root");
const renderer = new Render(container);
renderer.render(<App />);
