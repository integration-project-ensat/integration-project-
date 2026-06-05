external_url 'http://localhost:9080'
gitlab_rails['gitlab_shell_ssh_port'] = 2222
gitlab_rails['omniauth_enabled'] = true
gitlab_rails['omniauth_allow_single_sign_on'] = ['openid_connect']
gitlab_rails['omniauth_sync_email_from_provider'] = 'openid_connect'
gitlab_rails['omniauth_sync_profile_from_provider'] = ['openid_connect']
gitlab_rails['omniauth_block_auto_created_users'] = false
gitlab_rails['omniauth_providers'] = [
  {
    name: "openid_connect",
    label: "Keycloak",
    args: {
      name: "openid_connect",
      scope: ["openid", "profile", "email"],
      response_type: "code",
      issuer: "http://localhost:8081/auth/realms/portfolio-realm",
      client_auth_method: "query",
      discovery: false,
      uid_field: "preferred_username",
      pkce: true,
      client_options: {
        identifier: "gitlab",
        secret: "hJrGe88aqHUaAZNb0nPHPCGLzAQSHqjD",
        redirect_uri: "http://localhost:9080/users/auth/openid_connect/callback",
        authorization_endpoint: "http://localhost:8081/auth/realms/portfolio-realm/protocol/openid-connect/auth",
        token_endpoint: "http://172.18.0.1:8081/auth/realms/portfolio-realm/protocol/openid-connect/token",
        userinfo_endpoint: "http://172.18.0.1:8081/auth/realms/portfolio-realm/protocol/openid-connect/userinfo",
        jwks_uri: "http://172.18.0.1:8081/auth/realms/portfolio-realm/protocol/openid-connect/certs"
      }
    }
  }
]
