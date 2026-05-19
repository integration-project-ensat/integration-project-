const ROLES = {
    ETUDIANT: 'ETUDIANT',
    PROFESSEUR: 'PROFESSEUR',
    PROFESSIONNEL: 'PROFESSIONNEL',
    ADMINISTRATEUR: 'ADMINISTRATEUR'
};

const PUBLIC_ROLES = ['ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL'
];
const ADMIN_LEVELS = {
    STANDARD: 'STANDARD',
    SUPER_ADMIN: 'SUPER_ADMIN'
};
// Permissions par ressource/action
const PERMISSIONS = {
    USER: {
        CREATE_ADMIN: [ROLES.ADMINISTRATEUR],
        VALIDATE_PROFESSIONNEL: [ROLES.ADMINISTRATEUR],
        VIEW_PROFESSIONNELS_EN_ATTENTE: [ROLES.ADMINISTRATEUR]
    },
};
// Helper : vérifier si un rôle a une permission
const hasPermission = (userRole, permissionArray) => {
  return permissionArray.includes(userRole);
};
const isPublicRole = (role) => {
    return PUBLIC_ROLES.includes(role);
};

module.exports = {
  ROLES,
  PUBLIC_ROLES,
  ADMIN_LEVELS,
  PERMISSIONS,
  hasPermission,
  isPublicRole
};