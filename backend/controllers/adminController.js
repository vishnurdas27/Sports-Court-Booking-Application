const { Equipment, Coach, PricingRule, Court } = require('../models');

// --- EQUIPMENT ---
const addEquipment = async (req, res) => {
  try {
    const item = await Equipment.create(req.body);
    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: 'Error adding equipment' }); }
};

const deleteEquipment = async (req, res) => {
  try {
    await Equipment.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Equipment deleted' });
  } catch (e) { res.status(500).json({ message: 'Delete failed' }); }
};

// --- COACHES ---
const addCoach = async (req, res) => {
  try {
    const coach = await Coach.create(req.body);
    res.status(201).json(coach);
  } catch (e) { res.status(500).json({ message: 'Error adding coach' }); }
};

const deleteCoach = async (req, res) => {
  try {
    await Coach.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Coach deleted' });
  } catch (e) { res.status(500).json({ message: 'Delete failed' }); }
};

// --- PRICING RULES ---
const getRules = async (req, res) => {
  const rules = await PricingRule.findAll();
  res.json(rules);
};

const addRule = async (req, res) => {
  try {
    // Expected body: { name, type: 'peak_hour', multiplier: 1.5, startTime: '18:00', endTime: '21:00' }
    const rule = await PricingRule.create(req.body);
    res.status(201).json(rule);
  } catch (e) { res.status(500).json({ message: 'Error adding rule' }); }
};

const deleteRule = async (req, res) => {
  try {
    await PricingRule.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Rule deleted' });
  } catch (e) { res.status(500).json({ message: 'Delete failed' }); }
};

// --- COURT EDIT (Enable/Disable) ---
const updateCourt = async (req, res) => {
    try {
        const { isActive, basePricePerHour } = req.body;
        await Court.update(
            { isActive, basePricePerHour }, 
            { where: { id: req.params.id } }
        );
        res.json({ message: 'Court updated' });
    } catch (e) { res.status(500).json({ message: 'Update failed' }); }
};

module.exports = {
  addEquipment, deleteEquipment,
  addCoach, deleteCoach,
  getRules, addRule, deleteRule,
  updateCourt
};