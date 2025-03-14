module.exports = {
  presets: [
    ["@babel/preset-env", { targets: "defaults" }],
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "classic" }]
  ],
  plugins: ["@babel/plugin-transform-react-jsx"]
};