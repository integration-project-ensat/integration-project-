const ROLES = {
    ETUDIANT: 'ETUDIANT',
    PROFESSEUR: 'PROFESSEUR',
    PROFSSIONNEL: 'PROFSSIONNEL',
    ADMINISTATEUR: 'ADMINISTATEUR'
};

const PUBLIC_ROLES = [
    ETUDIANT = 'ETUDIANT',
    PROFESSEUR = 'PROFESSEUR',
    PROFSSIONNEL = 'PROFSSIONNEL'   
];

// Permissions par ressource/action
const PERMISSIONS = {
    USER: {
        CREATE_ADMIN: [ROLES.ADMINISTATEUR],
        VALIDATE_PROFESSIONNEL: [ROLES.ADMINISTATEUR],
        VIEW_PROFESSIONNELS_EN_ATTENTE: [ROLES.ADMINISTATEUR]
    },
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