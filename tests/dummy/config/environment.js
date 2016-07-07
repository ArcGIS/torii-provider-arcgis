/* jshint node: true */

module.exports = function(environment) {

  var ENV = {
    modulePrefix: 'dummy',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      portalBaseUrl: 'https://www.arcgis.com'
    },
    torii: {
      sessionServiceName: 'session',
      providers: {
        'arcgis-oauth-bearer': {
          apiKey: '6sC0ARLxo3RAL7L7' //'zDbzLJW6W4tcxHkj'
        }
      }
    }
  };

  //Overrides for testing to easily swap to AGO Iframe flow
  // ENV.torii.providers['arcgis-oauth-bearer'].portalUrl = ENV.APP.portalBaseUrl;
  // ENV.torii.providers['arcgis-oauth-bearer'].apiKey = 'arcgisonline';
  // ENV.torii.providers['arcgis-oauth-bearer'].remoteServiceName = 'iframe';
  // ENV.torii.providers['arcgis-oauth-bearer'].display = 'iframe';


  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.locationType = 'hash';
    ENV.baseURL = '/torii-provider-arcgis/';

  }

  return ENV;
};
