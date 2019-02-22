export default function (wallaby) {
  return {
    files: [
      'src/**/*.js'
    ],

    tests: [
      'test/**/*.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'ava'
  }
}
