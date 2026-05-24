#!/bin/bash
KEYCLOAK_URL="http://localhost:8081"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
REALM="portfolio-realm"

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
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "ERREUR : Impossible d'obtenir le token. Vérifiez que Keycloak est démarré sur $KEYCLOAK_URL"
  exit 1
fi

echo "Token obtenu ✓"

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
    "secret": "grafana-secret",
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
    "secret": "pgadmin-secret",
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
# 7. Créer le client sonarqube (SAML)
# ----------------------------------------------------------
echo ""
echo "[7/8] Création du client 'sonarqube' (SAML)..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "sonarqube",
    "name": "SonarQube",
    "enabled": true,
    "protocol": "saml",
    "redirectUris": ["http://localhost:9000/*"],
    "baseUrl": "http://localhost:9000",
    "adminUrl": "http://localhost:9000",
    "attributes": {
      "saml.authnstatement": "true",
      "saml_name_id_format": "email",
      "saml.force.name.id.format": "true",
      "saml.server.signature": "true",
      "saml.signature.algorithm": "RSA_SHA256",
      "saml.signing.certificate": "",
      "saml_assertion_consumer_url.post.0": "http://localhost:9000/saml2/callback",
      "saml_single_logout_service_url.front.0": "http://localhost:9000",
      "saml.force.post.binding": "true",
      "saml.artifact.binding": "false",
      "saml.onetimeuse.condition": "false",
      "saml_idp_initiated_sso_relay_state": "",
      "frontchannelLogout": "true"
    }
  }' > /dev/null

echo "  Client 'sonarqube' SAML créé ✓"

SONAR_CLIENT_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=sonarqube" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

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
# 8. Vérification finale
# ----------------------------------------------------------
echo ""
echo "[8/8] Vérification..."

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
SONAR_PASSWORD="PheraCore2025!"

# Récupérer le certificat du realm Keycloak
SONAR_CERT=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/keys" \
  -H "Authorization: Bearer $TOKEN" | \
  grep -o '"certificate":"[^"]*' | head -1 | cut -d'"' -f4)

# Attendre que SonarQube soit prêt
echo "  Attente que SonarQube soit prêt..."
MAX_WAIT=120
WAIT=0
until curl -s -u "$SONAR_ADMIN:$SONAR_PASSWORD" "$SONAR_URL/api/system/status" 2>/dev/null | grep -q '"status":"UP"'; do
  sleep 5
  WAIT=$((WAIT + 5))
  if [ $WAIT -ge $MAX_WAIT ]; then
    echo "  ATTENTION : SonarQube non disponible, configuration SAML ignorée"
    echo "  Relancez le script quand SonarQube sera démarré"
    break
  fi
  echo "  En attente SonarQube... ($WAIT s)"
done

if curl -s -u "$SONAR_ADMIN:$SONAR_PASSWORD" "$SONAR_URL/api/system/status" 2>/dev/null | grep -q '"status":"UP"'; then
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
echo " Clients  : grafana  (OIDC - secret: grafana-secret)"
echo "          : pgadmin  (OIDC - secret: pgadmin-secret)"
echo "          : sonarqube (SAML)"
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
echo " Accès Grafana   : http://localhost:3001"
echo " Accès PGAdmin   : http://localhost:5050"
echo " Accès SonarQube : http://localhost:9000"
echo ""
echo " NOTE: Pour PGAdmin, lancez setup-pgadmin.sh après que"
echo "       chef@portfolio.com et adjoint@portfolio.com"
echo "       se soient connectés une première fois."
echo "=================================================="