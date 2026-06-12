import os
AUTHENTICATION_SOURCES = ['oauth2', 'internal']
OAUTH2_AUTO_CREATE_USER = True
KEYCLOAK_PUBLIC_URL = os.environ.get('KEYCLOAK_PUBLIC_URL', 'http://localhost:8081/auth')
KEYCLOAK_INTERNAL_URL = os.environ.get('KEYCLOAK_INTERNAL_URL', 'http://keycloak:8080/auth')
OAUTH2_CONFIG = [
    {
        'OAUTH2_NAME': 'keycloak',
        'OAUTH2_DISPLAY_NAME': 'Keycloak',
        'OAUTH2_CLIENT_ID': 'pgadmin',
        'OAUTH2_CLIENT_SECRET': os.environ.get('PGADMIN_OAUTH_SECRET', 'pgadmin-secret'),
        'OAUTH2_TOKEN_URL': f'{KEYCLOAK_INTERNAL_URL}/realms/portfolio-realm/protocol/openid-connect/token',
        'OAUTH2_AUTHORIZATION_URL': f'{KEYCLOAK_PUBLIC_URL}/realms/portfolio-realm/protocol/openid-connect/auth',
        'OAUTH2_USERINFO_ENDPOINT': f'{KEYCLOAK_INTERNAL_URL}/realms/portfolio-realm/protocol/openid-connect/userinfo',
        'OAUTH2_SERVER_METADATA_URL': f'{KEYCLOAK_INTERNAL_URL}/realms/portfolio-realm/.well-known/openid-configuration',
        'OAUTH2_SCOPE': 'openid email profile',
        'OAUTH2_USERNAME_CLAIM': 'email',
        'OAUTH2_ICON': 'fa-lock',
        'OAUTH2_BUTTON_COLOR': '#0000ff',
        'OAUTH2_SSL_CERT_VERIFICATION': False
    }
]
