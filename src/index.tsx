import React from '@core/react';

import { createRoot } from "@core";
import { Router, Route } from "@core/router";

const Home = () => {
  return (
    <div>
      <a href="/about">about</a>
      <h1>Home Page</h1>
    </div>
  )
}

const About = () => {
  return (
    <div>
      <a href="/">home</a>
      <p>About Page</p>
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <Route path='/' element={Home} />
      <Route path='/about' element={About} />
    </Router>
  )
}

const root = createRoot(document.getElementById("root")!);
root.render(App());