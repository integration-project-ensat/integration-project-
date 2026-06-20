#!/bin/bash

PGADMIN_URL="http://localhost:5050"
PGADMIN_ADMIN_EMAIL="${PGADMIN_EMAIL:-admin@portfolio.com}"
PGADMIN_ADMIN_PASSWORD="${PGADMIN_PASSWORD:-admin123}"

CHEF_EMAIL="chef@portfolio.com"
ADJOINT_EMAIL="adjoint@portfolio.com"

echo "=================================================="
echo " PheraCore - Configuration PGAdmin"
echo "=================================================="

# ----------------------------------------------------------
# 1. Attendre que PGAdmin soit accessible
# ----------------------------------------------------------
echo ""
echo "[1/4] Attente que PGAdmin soit prêt..."

MAX_WAIT=60
WAIT=0
until curl -s "$PGADMIN_URL/misc/ping" > /dev/null 2>&1; do
  sleep 2
  WAIT=$((WAIT + 2))
  if [ $WAIT -ge $MAX_WAIT ]; then
    echo "ERREUR : PGAdmin n'est pas accessible après ${MAX_WAIT}s. Vérifiez que le container tourne."
    exit 1
  fi
  echo "  En attente... ($WAIT s)"
done

echo "PGAdmin accessible ✓"

# ----------------------------------------------------------
# 2. Se connecter et obtenir le cookie de session
# ----------------------------------------------------------
echo ""
echo "[2/4] Connexion à PGAdmin..."

COOKIE_JAR=$(mktemp)

# Obtenir le token CSRF
CSRF_TOKEN=$(curl -s -c "$COOKIE_JAR" "$PGADMIN_URL/login" | grep -o 'csrf_token[^"]*"[^"]*"' | head -1 | cut -d'"' -f3)

if [ -z "$CSRF_TOKEN" ]; then
  # Essayer autre méthode
  CSRF_TOKEN=$(curl -s -c "$COOKIE_JAR" "$PGADMIN_URL/login" | grep -o '"csrf_token": "[^"]*"' | cut -d'"' -f4)
fi

LOGIN_RESPONSE=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "$PGADMIN_URL/authenticate/login" \
  -H "Content-Type: application/json" \
  -H "X-pgA-CSRFToken: $CSRF_TOKEN" \
  -d "{\"email\": \"$PGADMIN_ADMIN_EMAIL\", \"password\": \"$PGADMIN_ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "Successfully logged in"; then
  echo "Connexion réussie ✓"
else
  # Essayer avec /login direct
  LOGIN_RESPONSE=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    -X POST "$PGADMIN_URL/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=$PGADMIN_ADMIN_EMAIL&password=$PGADMIN_ADMIN_PASSWORD&csrf_token=$CSRF_TOKEN")
  
  if echo "$LOGIN_RESPONSE" | grep -qi "logout\|dashboard\|browser"; then
    echo "Connexion réussie ✓"
  else
    echo "ERREUR : Impossible de se connecter à PGAdmin."
    echo "Vérifiez PGADMIN_EMAIL et PGADMIN_PASSWORD dans votre .env"
    rm -f "$COOKIE_JAR"
    exit 1
  fi
fi

# ----------------------------------------------------------
# 3. Vérifier que chef et adjoint ont déjà créé leur compte
# ----------------------------------------------------------
echo ""
echo "[3/4] Vérification des utilisateurs..."

USERS=$(curl -s -b "$COOKIE_JAR" "$PGADMIN_URL/user_management/user/")

CHEF_EXISTS=$(echo "$USERS" | grep -o "\"$CHEF_EMAIL\"" | head -1)
ADJOINT_EXISTS=$(echo "$USERS" | grep -o "\"$ADJOINT_EMAIL\"" | head -1)

if [ -z "$CHEF_EXISTS" ] && [ -z "$ADJOINT_EXISTS" ]; then
  echo ""
  echo "⚠️  ATTENTION : chef@portfolio.com et adjoint@portfolio.com"
  echo "   ne se sont pas encore connectés à PGAdmin."
  echo ""
  echo "   Demandez-leur de se connecter d'abord via :"
  echo "   http://localhost:5050 → Login with Keycloak"
  echo ""
  echo "   Puis relancez ce script."
  rm -f "$COOKIE_JAR"
  exit 1
elif [ -z "$CHEF_EXISTS" ]; then
  echo "⚠️  chef@portfolio.com n'a pas encore créé son compte. Demandez-lui de se connecter d'abord."
  rm -f "$COOKIE_JAR"
  exit 1
elif [ -z "$ADJOINT_EXISTS" ]; then
  echo "⚠️  adjoint@portfolio.com n'a pas encore créé son compte. Demandez-lui de se connecter d'abord."
  rm -f "$COOKIE_JAR"
  exit 1
fi

echo "  Les deux utilisateurs existent ✓"

# ----------------------------------------------------------
# 4. Promouvoir chef et adjoint en Administrator
# ----------------------------------------------------------
echo ""
echo "[4/4] Promotion en Administrator..."

promote_user() {
  local EMAIL=$1

  # Récupérer l'ID de l'utilisateur
  USER_DATA=$(curl -s -b "$COOKIE_JAR" "$PGADMIN_URL/user_management/user/")
  USER_ID=$(echo "$USER_DATA" | grep -o "\"id\":[0-9]*,\"email\":\"$EMAIL\"" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

  if [ -z "$USER_ID" ]; then
    # Essayer autre format JSON
    USER_ID=$(echo "$USER_DATA" | python3 -c "
import sys, json
data = json.load(sys.stdin)
users = data.get('users', data) if isinstance(data, dict) else data
for u in users:
    if u.get('email') == '$EMAIL':
        print(u.get('id'))
        break
" 2>/dev/null)
  fi

  if [ -z "$USER_ID" ]; then
    echo "  ERREUR : Impossible de trouver l'ID de $EMAIL"
    return 1
  fi

  # Promouvoir en Administrator (role=1)
  PROMOTE_RESPONSE=$(curl -s -b "$COOKIE_JAR" \
    -X PUT "$PGADMIN_URL/user_management/user/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "X-pgA-CSRFToken: $CSRF_TOKEN" \
    -d "{\"role\": \"1\"}")

  if echo "$PROMOTE_RESPONSE" | grep -q "\"id\":$USER_ID"; then
    echo "  $EMAIL promu Administrator ✓"
  else
    echo "  $EMAIL : promotion effectuée (vérifiez manuellement si besoin)"
  fi
}

promote_user "$CHEF_EMAIL"
promote_user "$ADJOINT_EMAIL"

rm -f "$COOKIE_JAR"

# ----------------------------------------------------------
# Résumé final
# ----------------------------------------------------------
echo ""
echo "=================================================="
echo " Configuration PGAdmin terminée !"
echo "=================================================="
echo ""
echo " Administrateurs : chef@portfolio.com"
echo "                 : adjoint@portfolio.com"
echo ""
echo " Accès PGAdmin : http://localhost:5050"
echo "=================================================="