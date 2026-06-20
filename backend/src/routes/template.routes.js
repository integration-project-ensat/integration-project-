const express = require('express')
const router = express.Router()

const service = require('../services/adminTemplate.service')

router.get('/', async (req, res) => {
  const data = await service.getAll()
  res.json(data)
})

module.exports = router