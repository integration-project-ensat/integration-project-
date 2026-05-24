const session = require('express-session');
const Keycloak = require('keycloak-connect');

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || 'portfolio-realm',
  'auth-server-url': process.env.KEYCLOAK_URL || 'http:/cd ../keycloak:8080',
  'ssl-required': 'none',
  resource: process.env.KEYCLOAK_CLIENT_ID || 'portfolio-app',
  'public-client': true,
  'confidential-port': 0
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

module.exports = { keycloak, memoryStore };