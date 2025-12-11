const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    addEquipment, deleteEquipment, 
    addCoach, deleteCoach, 
    getRules, addRule, deleteRule,
    updateCourt
} = require('../controllers/adminController');


router.use(protect, admin);

// Equipment
router.post('/equipment', addEquipment);
router.delete('/equipment/:id', deleteEquipment);

// Coaches
router.post('/coaches', addCoach);
router.delete('/coaches/:id', deleteCoach);

// Rules
router.get('/rules', getRules);
router.post('/rules', addRule);
router.delete('/rules/:id', deleteRule);

// Courts Update
router.put('/courts/:id', updateCourt);

module.exports = router;