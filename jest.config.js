const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

// https://kulshekhar.github.io/ts-jest/docs/getting-started/installation

module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};