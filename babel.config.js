module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
        useBuiltIns: "entry", // alternative mode: "entry"/ "usage"
        corejs: 3, // default would be 2
      },
    ],
    "@babel/preset-typescript",
  ],
};
