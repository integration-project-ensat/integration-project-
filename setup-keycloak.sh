#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYCLOAK_URL="http://localhost:8081/auth"
KEYCLOAK_ADMIN_USER="${KEYCLOAK_ADMIN_USER:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM="portfolio-realm"

if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$SCRIPT_DIR/.env"
  set +a
fi

SONAR_PASSWORD="${SONAR_PASSWORD:-PheraCore2025!}"
GRAFANA_OAUTH_SECRET="${GRAFANA_OAUTH_SECRET:-grafana-secret}"
PGADMIN_OAUTH_SECRET="${PGADMIN_OAUTH_SECRET:-pgadmin-secret}"
GITLAB_OAUTH_SECRET="${GITLAB_OAUTH_SECRET:-hJrGe88aqHUaAZNb0nPHPCGLzAQSHqjD}"

delete_client_if_exists() {
  local CLIENT_ID="$1"
  local EXISTING_ID

  EXISTING_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  if [[ -n "$EXISTING_ID" ]]; then
    curl -s -X DELETE "$KEYCLOAK_URL/admin/realms/$REALM/clients/$EXISTING_ID" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
  fi
}

echo "=================================================="
echo " PheraCore - Configuration Keycloak"
echo "=================================================="

# ----------------------------------------------------------
# 1. Obtenir le token admin
# ----------------------------------------------------------
echo ""
echo "[1/8] Obtention du token admin..."

TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$KEYCLOAK_ADMIN_USER" \
  -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "ERREUR : Impossible d'obtenir le token. Vérifiez que Keycloak est démarré sur $KEYCLOAK_URL"
  exit 1
fi

echo "Token obtenu ✓"
delete_client_if_exists "grafana"
delete_client_if_exists "pgadmin"
delete_client_if_exists "gitlab"
delete_client_if_exists "sonarqube"

# ----------------------------------------------------------
# 2. Créer le realm portfolio-realm avec hardening
# ----------------------------------------------------------
echo ""
echo "[2/8] Création du realm '$REALM' avec hardening..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "portfolio-realm",
    "displayName": "Portfolio Realm",
    "enabled": true,
    "registrationAllowed": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "bruteForceProtected": true,
    "failureFactor": 5,
    "waitIncrementSeconds": 30,
    "maxFailureWaitSeconds": 900,
    "minimumQuickLoginWaitSeconds": 60,
    "quickLoginCheckMilliSeconds": 1000,
    "maxDeltaTimeSeconds": 43200,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 28800,
    "clientSessionIdleTimeout": 1800,
    "clientSessionMaxLifespan": 28800,
    "accessTokenLifespan": 300,
    "passwordPolicy": "length(8) and upperCase(1) and lowerCase(1) and specialChars(1) and digits(1)"
  }' > /dev/null

echo "Realm '$REALM' créé avec hardening ✓"

# ----------------------------------------------------------
# 3. Créer les 6 rôles
# ----------------------------------------------------------
echo ""
echo "[3/8] Création des rôles..."

create_role() {
  local ROLE_NAME=$1
  local ROLE_DESC=$2
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/roles" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$ROLE_NAME\", \"description\": \"$ROLE_DESC\"}" > /dev/null
  echo "  Rôle '$ROLE_NAME' créé ✓"
}

create_role "chef-equipe"  "Chef equipe - Super Admin et coordinateur principal"
create_role "adjoint"      "Adjoint chef - Backup Manager et responsable CI-CD"
create_role "developpeur"  "Developpeur - Frontend et Backend"
create_role "devops"       "DevOps - Infrastructure et automatisation"
create_role "qa"           "Assurance Qualite - Tests et strategie qualite"
create_role "securite"     "Securite - Securite applicative et infrastructure"

# ----------------------------------------------------------
# 4. Créer les 10 utilisateurs avec rôles et passwords
# ----------------------------------------------------------
echo ""
echo "[4/8] Création des utilisateurs..."

create_user() {
  local USERNAME=$1
  local EMAIL=$2
  local FIRSTNAME=$3
  local LASTNAME=$4
  local PASSWORD=$5
  local ROLE=$6

  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$USERNAME\",
      \"email\": \"$EMAIL\",
      \"firstName\": \"$FIRSTNAME\",
      \"lastName\": \"$LASTNAME\",
      \"enabled\": true,
      \"emailVerified\": true,
      \"credentials\": [{
        \"type\": \"password\",
        \"value\": \"$PASSWORD\",
        \"temporary\": false
      }]
    }" > /dev/null

  USER_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$USERNAME" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  ROLE_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/roles/$ROLE" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "[{\"id\": \"$ROLE_ID\", \"name\": \"$ROLE\"}]" > /dev/null

  echo "  Utilisateur '$USERNAME' créé avec rôle '$ROLE' ✓"
}

create_user "chef-equipe"  "chef@portfolio.com"      "Salsabil"     "Bekkali"        "PheraCore2025!" "chef-equipe"
create_user "adjoint"      "adjoint@portfolio.com"   "Khadija"      "Baskar"         "PheraCore2025!" "adjoint"
create_user "dev-frontend" "frontend@portfolio.com"  "Ferdaous"     "Hayoun"         "PheraCore2025!" "developpeur"
create_user "dev-backend"  "backend@portfolio.com"   "Hind"         "Ahannach"       "PheraCore2025!" "developpeur"
create_user "devops1"      "devops1@portfolio.com"   "Nabil"        "Aitdriss"       "PheraCore2025!" "devops"
create_user "devops2"      "devops2@portfolio.com"   "Dounia"       "Khayar"         "PheraCore2025!" "devops"
create_user "qa1"          "qa1@portfolio.com"       "Aimad Eddine" "Slimani"        "PheraCore2025!" "qa"
create_user "qa2"          "qa2@portfolio.com"       "Salma"        "Ouledbouyahya"  "PheraCore2025!" "qa"
create_user "securite1"    "securite1@portfolio.com" "Soumaya"      "Hajli"          "PheraCore2025!" "securite"
create_user "securite2"    "securite2@portfolio.com" "Saad"         "Chair"          "PheraCore2025!" "securite"

# ----------------------------------------------------------
# 5. Créer le client grafana
# ----------------------------------------------------------
echo ""
echo "[5/8] Création du client 'grafana'..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "grafana",
    "name": "Grafana",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": false,
    "clientAuthenticatorType": "client-secret",
    "secret": "'"$GRAFANA_OAUTH_SECRET"'",
    "redirectUris": ["http://localhost:3001/*"],
    "webOrigins": ["http://localhost:3001"],
    "standardFlowEnabled": true,
    "directAccessGrantsEnabled": true
  }' > /dev/null

echo "  Client 'grafana' créé ✓"

GRAFANA_CLIENT_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=grafana" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "  Ajout du mapper 'realm-roles'..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$GRAFANA_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "realm-roles",
    "protocol": "openid-connect",
    "protocolMapper": "oidc-usermodel-realm-role-mapper",
    "consentRequired": false,
    "config": {
      "multivalued": "true",
      "userinfo.token.claim": "true",
      "id.token.claim": "true",
      "access.token.claim": "true",
      "claim.name": "roles",
      "jsonType.label": "String"
    }
  }' > /dev/null

echo "  Mapper 'realm-roles' ajouté ✓"

# ----------------------------------------------------------
# 6. Créer le client pgadmin
# ----------------------------------------------------------
echo ""
echo "[6/8] Création du client 'pgadmin'..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "pgadmin",
    "name": "PGAdmin",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": false,
    "clientAuthenticatorType": "client-secret",
    "secret": "'"$PGADMIN_OAUTH_SECRET"'",
    "redirectUris": ["http://localhost:5050/*"],
    "webOrigins": ["http://localhost:5050"],
    "standardFlowEnabled": true,
    "directAccessGrantsEnabled": true
  }' > /dev/null

echo "  Client 'pgadmin' créé ✓"

PGADMIN_CLIENT_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=pgadmin" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "  Ajout du mapper 'realm-roles' pour pgadmin..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$PGADMIN_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "realm-roles",
    "protocol": "openid-connect",
    "protocolMapper": "oidc-usermodel-realm-role-mapper",
    "consentRequired": false,
    "config": {
      "multivalued": "true",
      "userinfo.token.claim": "true",
      "id.token.claim": "true",
      "access.token.claim": "true",
      "claim.name": "roles",
      "jsonType.label": "String"
    }
  }' > /dev/null

echo "  Ajout du mapper 'email' pour pgadmin..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$PGADMIN_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "email",
    "protocol": "openid-connect",
    "protocolMapper": "oidc-usermodel-property-mapper",
    "consentRequired": false,
    "config": {
      "userinfo.token.claim": "true",
      "user.attribute": "email",
      "id.token.claim": "true",
      "access.token.claim": "true",
      "claim.name": "email",
      "jsonType.label": "String"
    }
  }' > /dev/null

echo "  Mappers pgadmin ajoutés ✓"

# ----------------------------------------------------------
# 7. Créer le client gitlab (OIDC)
# ----------------------------------------------------------
echo ""
echo "[7/9] Création du client 'gitlab' (OIDC)..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "gitlab",
    "name": "GitLab",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": false,
    "clientAuthenticatorType": "client-secret",
    "secret": "'"$GITLAB_OAUTH_SECRET"'",
    "redirectUris": ["http://localhost:9080/users/auth/openid_connect/callback"],
    "webOrigins": ["http://localhost:9080"],
    "standardFlowEnabled": true,
    "directAccessGrantsEnabled": true,
    "attributes": {
      "oidc.token.endpoint.auth.method": "query"
    }
  }' > /dev/null

echo "  Client 'gitlab' créé ✓"

GITLAB_CLIENT_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=gitlab" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "  Ajout du mapper 'preferred_username' pour gitlab..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$GITLAB_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "preferred_username",
    "protocol": "openid-connect",
    "protocolMapper": "oidc-usermodel-property-mapper",
    "consentRequired": false,
    "config": {
      "userinfo.token.claim": "true",
      "user.attribute": "username",
      "id.token.claim": "true",
      "access.token.claim": "true",
      "claim.name": "preferred_username",
      "jsonType.label": "String"
    }
  }' > /dev/null

echo "  Ajout du mapper 'email' pour gitlab..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$GITLAB_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "email",
    "protocol": "openid-connect",
    "protocolMapper": "oidc-usermodel-property-mapper",
    "consentRequired": false,
    "config": {
      "userinfo.token.claim": "true",
      "user.attribute": "email",
      "id.token.claim": "true",
      "access.token.claim": "true",
      "claim.name": "email",
      "jsonType.label": "String"
    }
  }' > /dev/null

echo "  Mappers gitlab ajoutés ✓"

# ----------------------------------------------------------
# 8. Créer le client sonarqube (SAML)
# ----------------------------------------------------------
echo ""
echo "[8/9] Création du client 'sonarqube' (SAML)..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "sonarqube",
    "name": "SonarQube",
    "enabled": true,
    "protocol": "saml",
    "baseUrl": "http://localhost:9000",
    "adminUrl": "http://localhost:9000"
  }' > /dev/null

echo "  Client 'sonarqube' SAML créé ✓"

SONAR_CLIENT_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=sonarqube" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "  Configuration SAML du client sonarqube..."

SONAR_PS1="$(mktemp --suffix=.ps1)"
cat > "$SONAR_PS1" <<'PS1'
param(
  [string]$KeycloakUrl,
  [string]$Token,
  [string]$Realm,
  [string]$ClientId
)

$client = Invoke-RestMethod -Headers @{ Authorization = "Bearer $Token" } -Uri "$KeycloakUrl/admin/realms/$Realm/clients/$ClientId"
$client.redirectUris = @('http://localhost:9000/*')
$client.webOrigins = @('http://localhost:9000')
$client.frontchannelLogout = $true
$client.standardFlowEnabled = $true
$client.directAccessGrantsEnabled = $false

$attrs = @{}
if ($client.attributes) {
  $client.attributes.psobject.Properties | ForEach-Object {
    $attrs[$_.Name] = $_.Value
  }
}
$attrs['saml.client.signature'] = 'false'
$attrs['saml.force.post.binding'] = 'true'
$attrs['saml.server.signature'] = 'true'
$attrs['saml.authnstatement'] = 'true'
$attrs['saml_name_id_format'] = 'email'
$attrs['saml.force.name.id.format'] = 'true'
$attrs['saml.signature.algorithm'] = 'RSA_SHA256'
$attrs['saml.allow.ecp.flow'] = 'false'
$attrs['saml.onetimeuse.condition'] = 'false'
$attrs['saml_signature_canonicalization_method'] = 'http://www.w3.org/2001/10/xml-exc-c14n#'
$attrs['saml.assertion.consumer.url.post.0'] = 'http://localhost:9000/saml2/callback'
$attrs['saml.single.logout.service.url.post.0'] = 'http://localhost:9000'
$client.attributes = $attrs

$json = $client | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Put -Uri "$KeycloakUrl/admin/realms/$Realm/clients/$ClientId" -Headers @{ Authorization = "Bearer $Token" } -ContentType 'application/json' -Body $json | Out-Null
PS1

"C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "$SONAR_PS1" \
  -KeycloakUrl "$KEYCLOAK_URL" \
  -Token "$TOKEN" \
  -Realm "$REALM" \
  -ClientId "$SONAR_CLIENT_ID"
SONAR_PUT_CODE=$?
rm -f "$SONAR_PS1"

if [[ "$SONAR_PUT_CODE" != "0" ]]; then
  echo "  ERREUR : impossible de configurer le client sonarqube (HTTP $SONAR_PUT_CODE)"
  exit 1
fi

echo "  Configuration SAML du client sonarqube appliquée ✓"

echo "  Ajout des mappers SAML pour sonarqube..."

# Mapper: name
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$SONAR_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "name",
    "protocol": "saml",
    "protocolMapper": "saml-user-property-mapper",
    "consentRequired": false,
    "config": {
      "attribute.nameformat": "Basic",
      "user.attribute": "firstName",
      "attribute.name": "name"
    }
  }' > /dev/null

# Mapper: email
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$SONAR_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "email",
    "protocol": "saml",
    "protocolMapper": "saml-user-property-mapper",
    "consentRequired": false,
    "config": {
      "attribute.nameformat": "Basic",
      "user.attribute": "email",
      "attribute.name": "email"
    }
  }' > /dev/null

# Mapper: login
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$SONAR_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "login",
    "protocol": "saml",
    "protocolMapper": "saml-user-property-mapper",
    "consentRequired": false,
    "config": {
      "attribute.nameformat": "Basic",
      "user.attribute": "username",
      "attribute.name": "login"
    }
  }' > /dev/null

# Mapper: groups (roles) - Single Role Attribute ON
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$SONAR_CLIENT_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "groups",
    "protocol": "saml",
    "protocolMapper": "saml-role-list-mapper",
    "consentRequired": false,
    "config": {
      "attribute.nameformat": "Basic",
      "attribute.name": "Role",
      "single": "true"
    }
  }' > /dev/null

echo "  Mappers SAML sonarqube ajoutés ✓"

# ----------------------------------------------------------
# 9. Vérification finale
# ----------------------------------------------------------
echo ""
echo "[9/9] Vérification..."

REALM_CHECK=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"realm":"[^"]*' | cut -d'"' -f4)

if [ "$REALM_CHECK" = "$REALM" ]; then
  echo "  Realm vérifié ✓"
else
  echo "  ERREUR : Realm non trouvé !"
fi


# ----------------------------------------------------------
# Configuration SAML dans SonarQube
# ----------------------------------------------------------
echo ""
echo "[+] Configuration SAML dans SonarQube..."

SONAR_URL="http://localhost:9000"
SONAR_ADMIN="admin"
SONAR_PASSWORD="${SONAR_PASSWORD:-PheraCore2025!}"

# Récupérer le certificat SAML du realm Keycloak
echo "  Récupération du certificat SAML Keycloak..."
SONAR_CERT_B64=$(
  curl -sS --connect-timeout 10 --max-time 20 "$KEYCLOAK_URL/realms/$REALM/protocol/saml/descriptor" | awk '
    /<ds:X509Certificate>/ {
      in_cert = 1
      sub(/.*<ds:X509Certificate>/, "")
    }
    in_cert {
      if (match($0, /<\/ds:X509Certificate>/)) {
        sub(/<\/ds:X509Certificate>.*/, "")
        cert = cert $0
        gsub(/[[:space:]]/, "", cert)
        print cert
        exit
      }
      cert = cert $0
    }
  '
)

if [[ -z "$SONAR_CERT_B64" ]]; then
  echo "ERREUR : impossible de récupérer le certificat SAML Keycloak"
  exit 1
fi

SONAR_CERT=$(
  {
    echo "-----BEGIN CERTIFICATE-----"
    printf '%s' "$SONAR_CERT_B64" | fold -w 64
    echo "-----END CERTIFICATE-----"
  }
)

# Attendre que SonarQube soit prêt
echo "  Attente que SonarQube soit prêt..."
MAX_WAIT=120
WAIT=0
until curl -sS --connect-timeout 5 --max-time 15 -u "$SONAR_ADMIN:$SONAR_PASSWORD" "$SONAR_URL/api/system/status" 2>/dev/null | grep -q '"status":"UP"'; do
  sleep 5
  WAIT=$((WAIT + 5))
  if [ $WAIT -ge $MAX_WAIT ]; then
    echo "  ATTENTION : SonarQube non disponible, configuration SAML ignorée"
    echo "  Relancez le script quand SonarQube sera démarré"
    break
  fi
  echo "  En attente SonarQube... ($WAIT s)"
done

if curl -sS --connect-timeout 5 --max-time 15 -u "$SONAR_ADMIN:$SONAR_PASSWORD" "$SONAR_URL/api/system/status" 2>/dev/null | grep -q '"status":"UP"'; then
  # Activer SAML
  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "key=sonar.auth.saml.enabled&value=true" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "key=sonar.auth.saml.applicationId&value=sonarqube" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "key=sonar.auth.saml.providerName&value=Keycloak" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    --data-urlencode "key=sonar.auth.saml.providerId" \
    --data-urlencode "value=http://localhost:8081/auth/realms/portfolio-realm" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    --data-urlencode "key=sonar.auth.saml.loginUrl" \
    --data-urlencode "value=http://localhost:8081/auth/realms/portfolio-realm/protocol/saml" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    --data-urlencode "key=sonar.auth.saml.certificate.secured" \
    --data-urlencode "value=$SONAR_CERT" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "key=sonar.auth.saml.user.login&value=login" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "key=sonar.auth.saml.user.name&value=name" > /dev/null

  curl -s -X POST "$SONAR_URL/api/settings/set" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "key=sonar.auth.saml.user.email&value=email" > /dev/null

  echo "  SAML SonarQube configuré ✓"

  # Création du projet pheracore s'il n'existe pas
  curl -s -X POST "$SONAR_URL/api/projects/create" \
    -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
    -d "name=pheracore&project=pheracore" > /dev/null

  echo "  Attribution de l'accès projet à sonar-users..."
  SONAR_PERMISSION_CODE=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST \
      "$SONAR_URL/api/permissions/add_group?permission=user&groupName=sonar-users&projectKey=pheracore" \
      -u "$SONAR_ADMIN:$SONAR_PASSWORD"
  )
  echo "  Accès projet SonarQube attribué à sonar-users ✓"

  echo "  Application du template de permissions par défaut au projet..."
  SONAR_TEMPLATE_CODE=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST \
      "$SONAR_URL/api/permissions/apply_template" \
      -u "$SONAR_ADMIN:$SONAR_PASSWORD" \
      --data-urlencode "templateName=Default template" \
      --data-urlencode "projectKey=pheracore"
  )

  if [[ "$SONAR_TEMPLATE_CODE" != "200" && "$SONAR_TEMPLATE_CODE" != "204" ]]; then
    echo "  ATTENTION : impossible d'appliquer le template de permissions (HTTP $SONAR_TEMPLATE_CODE)"
  else
    echo "  Template de permissions appliqué ✓"
  fi

  if docker ps --format '{{.Names}}' | grep -qx 'portfolio_sonarqube'; then
    echo "  Redémarrage de SonarQube pour appliquer la configuration..."
    docker restart portfolio_sonarqube >/dev/null
    echo "  SonarQube redémarré ✓"
  fi
fi

# ----------------------------------------------------------
# Résumé final
# ----------------------------------------------------------
echo ""
echo "=================================================="
echo " Configuration terminée avec succès !"
echo "=================================================="
echo ""
echo " Realm    : portfolio-realm"
echo " Rôles    : chef-equipe, adjoint, developpeur, devops, qa, securite"
echo " Users    : 10 utilisateurs créés"
echo " Clients  : grafana    (OIDC - secret: $GRAFANA_OAUTH_SECRET)"
echo "          : pgadmin    (OIDC - secret: $PGADMIN_OAUTH_SECRET)"
echo "          : gitlab     (OIDC - secret: $GITLAB_OAUTH_SECRET)"
echo "          : sonarqube  (SAML)"
echo " Password : PheraCore2025! (pour tous les utilisateurs)"
echo ""
echo " Hardening activé :"
echo "   - Password policy : 8 chars, maj, min, spécial, chiffre"
echo "   - Brute force : 5 tentatives max, 15min lockout"
echo "   - Session idle : 30min"
echo "   - Session max  : 8h"
echo "   - Enregistrement public : désactivé"
echo ""
echo " Accès Keycloak  : http://localhost:8081/auth"
echo " Accès GitLab    : http://localhost:9080"
echo " Accès Grafana   : http://localhost:3001"
echo " Accès PGAdmin   : http://localhost:5050"
echo " Accès SonarQube : http://localhost:9000"
echo ""
echo " NOTE: Pour PGAdmin, lancez setup-pgadmin.sh après que"
echo "       chef@portfolio.com et adjoint@portfolio.com"
echo "       se soient connectés une première fois."
echo "=================================================="
