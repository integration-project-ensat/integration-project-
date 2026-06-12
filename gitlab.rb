external_url 'http://localhost:9080'
gitlab_rails['gitlab_shell_ssh_port'] = 2222
gitlab_rails['omniauth_enabled'] = true
gitlab_rails['omniauth_allow_single_sign_on'] = ['openid_connect']
gitlab_rails['omniauth_sync_email_from_provider'] = 'openid_connect'
gitlab_rails['omniauth_sync_profile_from_provider'] = ['openid_connect']
gitlab_rails['omniauth_block_auto_created_users'] = false
keycloak_internal = 'http://keycloak:8080/auth'
gitlab_oidc_secret = ENV.fetch('GITLAB_OAUTH_SECRET', 'hJrGe88aqHUaAZNb0nPHPCGLzAQSHqjD')
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
        secret: gitlab_oidc_secret,
        redirect_uri: "http://localhost:9080/users/auth/openid_connect/callback",
        authorization_endpoint: "http://localhost:8081/auth/realms/portfolio-realm/protocol/openid-connect/auth",
        token_endpoint: "#{keycloak_internal}/realms/portfolio-realm/protocol/openid-connect/token",
        userinfo_endpoint: "#{keycloak_internal}/realms/portfolio-realm/protocol/openid-connect/userinfo",
        jwks_uri: "#{keycloak_internal}/realms/portfolio-realm/protocol/openid-connect/certs"
      }
    }
  }
]
