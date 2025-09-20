module.exports = {
  extends: [require.resolve('../../eslint.config.js')],
  parserOptions: {
    project: require.resolve('./tsconfig.json'),
  },
};
