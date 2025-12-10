const { PricingRule, Coach, Equipment } = require('../models');
const { Op } = require('sequelize');

const calculateTotal = async (court, startTime, endTime, coachId, equipmentList = []) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = (end - start) / (1000 * 60 * 60);
  const dayOfWeek = start.getDay();
  const startHour = start.getHours();

  let currentRate = court.basePrice;
  let breakdown = {
    base: court.basePrice * durationHours,
    modifiers: [],
    coach: 0,
    equipment: 0
  };

  const rules = await PricingRule.findAll();

  for (const rule of rules) {
    let applied = false;

    // Weekend Rule
    if (rule.type === 'weekend' && rule.applicableDays.includes(dayOfWeek)) {
      currentRate *= rule.multiplier;
      breakdown.modifiers.push(`${rule.name} (x${rule.multiplier})`);
      applied = true;
    }

    // Peak Hour Rule
    if (!applied && rule.type === 'peak_hour') {
      const ruleStart = parseInt(rule.startTime.split(':')[0]); 
      const ruleEnd = parseInt(rule.endTime.split(':')[0]);

      if (startHour >= ruleStart && startHour < ruleEnd) {
        currentRate *= rule.multiplier;
        breakdown.modifiers.push(`${rule.name} (x${rule.multiplier})`);
      }
    }
  }

  let totalCourtPrice = currentRate * durationHours;

  // Coach Fee
  if (coachId) {
    const coach = await Coach.findByPk(coachId);
    if (coach) {
      const coachFee = coach.hourlyRate * durationHours;
      breakdown.coach = coachFee;
      totalCourtPrice += coachFee;
    }
  }

  // Equipment Cost
  if (equipmentList.length > 0) {
    for (const item of equipmentList) {
      const equip = await Equipment.findByPk(item.id);
      if (equip) {
        const cost = equip.pricePerUnit * item.quantity; 
        totalCourtPrice += cost;
      }
    }
  }

  return { total: totalCourtPrice, breakdown };
};

module.exports = { calculateTotal };
