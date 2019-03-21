const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const CleanWebpackPlugin = require('clean-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpackMerge = require('webpack-merge');

// Here we will setup two targets, one is the node library and the other is the web library
const commonConfig = {
  devtool: 'source-map', // To be able to debug with Webstorm
  entry: {
    tools: './src/index.js',
  },
  output: {
    filename: '[name].js',
    library: 'tools',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this', // https://github.com/webpack/webpack/issues/6642#issuecomment-370222543
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  externals: {
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'Axios',
      root: 'Axios',
    },
    papaparse: {
      commonjs: 'papaparse',
      commonjs2: 'papaparse',
      amd: 'PapaParse',
      root: 'PapaParse',
    },
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};


module.exports = ['web', 'node'].map((target) => {
  let fname = `[name].${target}.js`;
  let nodeenv = {};

  if (target === 'node') {
    fname = '[name].js';
  }
  if (target === 'web') {
    nodeenv = {
      fs: 'empty', // Ignore FS dependency: https://github.com/react-boilerplate/react-boilerplate/issues/2279
    };
  }
  const base = webpackMerge(commonConfig, {
    target,
    output: {
      path: path.resolve(__dirname, './dist/'),
      filename: fname,
    },
    node: nodeenv,
  });

  return base;
});
