#!/bin/bash

KEYCLOAK_URL="http://localhost:8081"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
REALM="portfolio-realm"

echo "=================================================="
echo " PheraCore - Configuration Keycloak"
echo "=================================================="


# Obtenir le token admin

echo ""
echo "[1/5] Obtention du token admin..."

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


# Créer le realm portfolio-realm

echo ""
echo "[2/5] Création du realm '$REALM'..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "portfolio-realm",
    "displayName": "Portfolio Realm",
    "enabled": true,
    "registrationAllowed": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false
  }' > /dev/null

echo "Realm '$REALM' créé ✓"

# Créer les rôles

echo ""
echo "[3/5] Création des rôles..."

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

# Créer les 10 utilisateurs avec rôles et passwords

echo ""
echo "[4/5] Création des utilisateurs..."

create_user() {
  local USERNAME=$1
  local EMAIL=$2
  local FIRSTNAME=$3
  local LASTNAME=$4
  local PASSWORD=$5
  local ROLE=$6

  # Créer l'utilisateur
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

  # Obtenir l'ID de l'utilisateur
  USER_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$USERNAME" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  # Obtenir l'ID du rôle
  ROLE_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/roles/$ROLE" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

  # Assigner le rôle
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

# 5. Créer le client grafana
echo ""
echo "[5/5] Création du client 'grafana'..."

# Créer le client
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

# Obtenir l'ID du client
CLIENT_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=grafana" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Obtenir le client scope dédié
SCOPE_ID=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM/client-scopes" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*"[^}]*"name":"grafana-dedicated"' | grep -o '"id":"[^"]*' | cut -d'"' -f4)



echo "  Ajout du mapper 'realm-roles'..."

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_ID/protocol-mappers/models" \
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

# Summary

echo ""
echo "=================================================="
echo " Configuration terminée avec succès !"
echo "=================================================="
echo ""
echo " Realm    : portfolio-realm"
echo " Rôles    : chef-equipe, adjoint, developpeur, devops, qa, securite"
echo " Users    : 10 utilisateurs créés"
echo " Client   : grafana (secret: grafana-secret)"
echo " Password : PheraCore2025! (pour tous les utilisateurs)"
echo ""
echo " Accès Keycloak : http://localhost:8081"
echo " Accès Grafana  : http://localhost:3001"
echo "=================================================="