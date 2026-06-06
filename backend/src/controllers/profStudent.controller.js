const asyncHandler = require('../middlewares/asyncHandler')
const profStudentService = require('../services/profStudent.service')

const getProfessorId = (req) => BigInt(req.utilisateur.id_utilisateur)

const listStudents = asyncHandler(async (req, res) => {
  const data = await profStudentService.list(getProfessorId(req))

  res.json({
    success: true,
    message: 'Étudiants liés récupérés',
    data,
  })
})

const getStudentStatus = asyncHandler(async (req, res) => {
  const attached = await profStudentService.isAttached(getProfessorId(req), req.params.id)

  res.json({
    success: true,
    data: {
      attached,
    },
  })
})

const attachStudent = asyncHandler(async (req, res) => {
  const result = await profStudentService.attach(getProfessorId(req), {
    studentId: req.body?.id_etudiant,
    numeroEtudiant: req.body?.numero_etudiant,
  })

  res.status(result.created ? 201 : 200).json({
    success: true,
    message: result.created ? 'Étudiant ajouté à votre liste' : 'Étudiant déjà lié à votre liste',
    data: result.student,
    created: result.created,
  })
})

const detachStudent = asyncHandler(async (req, res) => {
  await profStudentService.detach(getProfessorId(req), req.params.id)

  res.json({
    success: true,
    message: 'Étudiant retiré de votre liste',
  })
})

const importStudentsCsv = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({
      success: false,
      message: 'Fichier CSV requis',
    })
  }

  const summary = await profStudentService.importCsv(getProfessorId(req), req.file.buffer)

  res.status(201).json({
    success: true,
    message: 'Import CSV terminé',
    data: summary,
  })
})

module.exports = {
  listStudents,
  getStudentStatus,
  attachStudent,
  detachStudent,
  importStudentsCsv,
}
