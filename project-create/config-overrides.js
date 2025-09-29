
module.exports = {
  webpack: (config) => {
    config.output.library = `project-create`;
    config.output.libraryTarget = 'umd';
    config.output.chunkLoadingGlobal = `webpackJsonp_project-create`;
    return config;
  },
  devServer: (config) => {
    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    config.historyApiFallback = true;
    config.hot = false;
    config.watchContentBase = false;
    config.liveReload = false;
    return config;
  },
};