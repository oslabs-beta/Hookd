// specifies environment variables and other options
module.exports = {
  "verbose": true,
  "roots": [
    "<rootDir>/tests"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "setupFilesAfterEnv": ["<rootDir>/tests/jest-preload.js"],
}