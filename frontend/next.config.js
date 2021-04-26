const defaultBackendUrl = "http://localhost:8000/:path*"
module.exports = {
  module: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: process.env.BACKEND_URL || defaultBackendUrl
        }
      ]
    };
  }
};