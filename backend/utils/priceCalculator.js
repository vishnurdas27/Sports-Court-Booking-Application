const { PricingRule, Coach, Equipment } = require('../models');

const calculateTotal = async (court, startTime, endTime, coachId, equipmentList = []) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const durationHours = (end - start) / (1000 * 60 * 60);
    const dayOfWeek = start.getDay();
    const startHour = start.getHours();

    let currentHourlyRate = court.basePrice; 
    
    let breakdown = {
        courtFee: 0, 
        modifiers: [],
        coach: 0,
        equipment: 0
    };

    const rules = await PricingRule.findAll();

    for (const rule of rules) {
        if (['weekend', 'holiday'].includes(rule.type)) {
            if (rule.applicableDays && rule.applicableDays.includes(dayOfWeek)) {
                currentHourlyRate = currentHourlyRate * rule.multiplier + rule.additionAmount;
                breakdown.modifiers.push(`${rule.name} (x${rule.multiplier} +₹${rule.additionAmount})`);
            }
        }

        if (rule.type === "peak_hour") {
            if (rule.startTime && rule.endTime) {
                const ruleStart = parseInt(rule.startTime.split(":")[0]);
                const ruleEnd = parseInt(rule.endTime.split(":")[0]);

                if (startHour >= ruleStart && startHour < ruleEnd) {
                    currentHourlyRate = currentHourlyRate * rule.multiplier + rule.additionAmount;
                    breakdown.modifiers.push(
                        `${rule.name} (peak x${rule.multiplier} +₹${rule.additionAmount})`
                    );
                }
            }
        }
    }


    const finalCourtFee = currentHourlyRate * durationHours;
    breakdown.courtFee = finalCourtFee;
    let total = finalCourtFee;


    if (coachId) {
        const coach = await Coach.findByPk(coachId);
        if (coach) {
            const coachFee = coach.hourleyRate * durationHours;
            breakdown.coach = coachFee;
            total += coachFee;
        }
    }

    for (const item of equipmentList) {
        const equipment = await Equipment.findByPk(item.id);
        if (equipment) {
            const cost = equipment.pricePerUnit * item.quantity;
            breakdown.equipment += cost;
            total += cost;
        }
    }

    return {
        total: Math.round(total),
        breakdown
    };
};

module.exports = { calculateTotal };