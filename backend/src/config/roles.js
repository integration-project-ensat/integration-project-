const ROLES = {
    ETUDIANT: 'ETUDIANT',
    PROFESSEUR: 'PROFESSEUR',
    PROFSSIONNEL: 'PROFSSIONNEL',
    ADMINISTATEUR: 'ADMINISTATEUR'
};

const PUBLIC_ROLES = [
    ROLES.ETUDIANT,
    ROLES.PROFESSEUR,
    ROLES.PROFSSIONNEL
];

// Permissions par ressource/action
const PERMISSIONS = {
    USER: {
        CREATE_ADMIN: [ROLES.ADMINISTATEUR],}
};
// Helper : vérifier si un rôle a une permission
const hasPermission = (userRole, permissionArray) => {
  return permissionArray.includes(userRole);
};

module.exports = {
  ROLES,
  PUBLIC_ROLES,
  PERMISSIONS,
  hasPermission
};