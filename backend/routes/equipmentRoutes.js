const express = require('express');
const router = express.Router();
const { getEquipment } = require('../controllers/equipmentController');

router.get('/', getEquipment);

module.exports = router;