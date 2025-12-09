const express = require('express')
const router = express.Router()
const {getAllCourts} = require('../controllers/courtController')

router.get('/',getAllCourts)

module.exports = router