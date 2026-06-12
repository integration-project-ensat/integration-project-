/**
 * @openapi
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nom:
 *           type: string
 *           example: "Dupont"
 *         prenom:
 *           type: string
 *           example: "Jean"
 *         email:
 *           type: string
 *           example: "jean.dupont@email.com"
 *         titre:
 *           type: string
 *           example: "Développeur Full Stack"
 *         bio:
 *           type: string
 *           example: "Développeur passionné avec 5 ans d'expérience"
 * 
 *     Diplome:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titre:
 *           type: string
 *           example: "Master Informatique"
 *         etablissement:
 *           type: string
 *           example: "Université de Paris"
 *         annee:
 *           type: integer
 *           example: 2023
 * 
 *     Competence:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nom:
 *           type: string
 *           example: "JavaScript"
 *         niveau:
 *           type: string
 *           enum: [debutant, intermediaire, avance, expert]
 *           example: "avance"
 * 
 *     Technologie:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nom:
 *           type: string
 *           example: "React"
 *         categorie:
 *           type: string
 *           example: "Frontend"
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Une erreur est survenue"
 * 
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Opération réussie"
 *         data:
 *           type: object
 */