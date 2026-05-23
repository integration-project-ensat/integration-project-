import os
AUTHENTICATION_SOURCES = ['oauth2', 'internal']
OAUTH2_AUTO_CREATE_USER = True
OAUTH2_CONFIG = [
    {
        'OAUTH2_NAME': 'keycloak',
        'OAUTH2_DISPLAY_NAME': 'Keycloak',
        'OAUTH2_CLIENT_ID': 'pgadmin',
        'OAUTH2_CLIENT_SECRET': os.environ.get('PGADMIN_OAUTH_SECRET', 'pgadmin-secret'),
        'OAUTH2_TOKEN_URL': 'http://172.18.0.1:8081/auth/realms/portfolio-realm/protocol/openid-connect/token',
        'OAUTH2_AUTHORIZATION_URL': 'http://localhost:8081/auth/realms/portfolio-realm/protocol/openid-connect/auth',
        'OAUTH2_USERINFO_ENDPOINT': 'http://172.18.0.1:8081/auth/realms/portfolio-realm/protocol/openid-connect/userinfo',
        'OAUTH2_SERVER_METADATA_URL': 'http://172.18.0.1:8081/auth/realms/portfolio-realm/.well-known/openid-configuration',
        'OAUTH2_SCOPE': 'openid email profile',
        'OAUTH2_USERNAME_CLAIM': 'email',
        'OAUTH2_ICON': 'fa-lock',
        'OAUTH2_BUTTON_COLOR': '#0000ff',
        'OAUTH2_SSL_CERT_VERIFICATION': False
    }
]