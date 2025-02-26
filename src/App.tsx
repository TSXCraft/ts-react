import React from "./core/createElement";

function Child() {
  return <span>This is child</span>;
}

function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <Child />
    </div>
  );
}

export default App;
