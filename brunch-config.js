let config = {
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

try {
  require('./local-config')(config);
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND')
    console.log('No local configuration loaded');
  else
    throw e;
}

module.exports = config;
