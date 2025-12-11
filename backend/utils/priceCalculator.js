// File: services/calculateTotal.js (Corrected)

const { PricingRule, Coach, Equipment } = require('../models');

const calculateTotal = async (court, startTime, endTime, coachId, equipmentList = []) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const durationHours = (end - start) / (1000 * 60 * 60);
    const dayOfWeek = start.getDay();
    const startHour = start.getHours();

    // Initialize hourly rate with the court's base price
    let currentHourlyRate = court.basePrice; 
    
    // Initialize breakdown structure
    let breakdown = {
        courtFee: 0, // Calculated after applying hourly modifiers
        modifiers: [],
        coach: 0,
        equipment: 0
    };

    // Fetch rules
    const rules = await PricingRule.findAll();

    for (const rule of rules) {
        // --- WEEKEND & HOLIDAY RULE ---
        if (['weekend', 'holiday'].includes(rule.type)) {
            if (rule.applicableDays && rule.applicableDays.includes(dayOfWeek)) {
                currentHourlyRate = currentHourlyRate * rule.multiplier + rule.additionAmount;
                breakdown.modifiers.push(`${rule.name} (x${rule.multiplier} +₹${rule.additionAmount})`);
            }
        }

        // --- PEAK HOUR RULE ---
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

    // 1. Calculate the final COURT FEE based on the modified hourly rate
    const finalCourtFee = currentHourlyRate * durationHours;
    breakdown.courtFee = finalCourtFee;
    let total = finalCourtFee; // Start the total with the final court fee

    /* --------------------------
       2. COACH PRICE
    ----------------------------- */
    if (coachId) {
        const coach = await Coach.findByPk(coachId);
        if (coach) {
            // ✅ FIX: Use 'hourleyRate' as defined in the Coach model
            const coachFee = coach.hourleyRate * durationHours;
            breakdown.coach = coachFee;
            total += coachFee;
        }
    }

    /* --------------------------
       3. EQUIPMENT PRICE
    ----------------------------- */
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