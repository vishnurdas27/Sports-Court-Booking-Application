const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./User');
const Court = require('./Court');
const Booking = require('./Booking');
const Coach = require('./Coach');
const Equipment = require('./Equipment');
const PricingRule = require('./PricingRule');

// --- ASSOCIATIONS ---

// 1. USER <-> BOOKING (One-to-Many)
// A booking MUST belong to a user (allowNull: false)
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { 
    foreignKey: {
        name: 'userId',
        allowNull: false 
    }
});

// 2. COURT <-> BOOKING (One-to-Many)
// A booking MUST belong to a court (allowNull: false)
Court.hasMany(Booking, { foreignKey: 'courtId' });
Booking.belongsTo(Court, { 
    foreignKey: {
        name: 'courtId',
        allowNull: false 
    }
});

// 3. COACH <-> BOOKING (One-to-Many)
// A booking MIGHT have a coach (allowNull: true is default, but good to be explicit)
Coach.hasMany(Booking, { foreignKey: 'coachId' });
Booking.belongsTo(Coach, { 
    foreignKey: {
        name: 'coachId',
        allowNull: true 
    }
});

// 4. BOOKING <-> EQUIPMENT (Many-to-Many)
// Define the specific Junction Table with extra 'quantity' field
const BookingEquipment = sequelize.define('BookingEquipment', {
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  }
});

Booking.belongsToMany(Equipment, {
  through: BookingEquipment,
  foreignKey: 'bookingId'
});
Equipment.belongsToMany(Booking, {
  through: BookingEquipment,
  foreignKey: 'equipmentId'
});

module.exports = {
  sequelize,
  User,
  Coach,
  Booking,
  Court,
  Equipment,
  PricingRule,
  BookingEquipment
};