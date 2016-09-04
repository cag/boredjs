module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'bored.js': /^app[\\/]boredjs/,
        'app.js': /^app[\\/](?!boredjs)/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {presets: ['es2015']}
  },

  server: {
    hostname: '0.0.0.0'
  }
};
