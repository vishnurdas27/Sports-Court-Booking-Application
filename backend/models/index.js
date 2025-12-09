const sequelize = require('../config/database')
const {DataTypes} = require('sequelize')

const User = require('./User')
const Court = require('./Court')
const Booking = require('./Booking')
const Coach = require('./Coach')
const Equipment = require('./Equipment')
const PricingRule = require('./PricingRule')

// User & Booking
User.hasMany(Booking,{foreignKey: ' userId'})
Booking.belongsTo(User, {foreignKey: 'UserId'})

//Cout & Booking
Court.hasMany(Booking, {foreignKey: 'courtId'})
Booking.belongsTo(Court, {foreignKey: 'courtId'})

//Coach & Booking
Coach.hasMany(Booking, {foreignKey:'coachId'})
Booking.belongsTo(Coach, {foreignKey:'coachId', allowNull: true})

const BookingEquipment = sequelize.define('BookingEquipment', {
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull:false
    }
})

// Booking & Equipment
Booking.belongsToMany(Equipment, {through: BookingEquipment, foreignKey: 'bookingId'})
Equipment.belongsToMany(Booking, {through: BookingEquipment, foreignKey:'equipmentId'})

module.exports = {
    sequelize,
    User,
    Coach,
    Booking,
    Court,
    Equipment,
    PricingRule,
    BookingEquipment
}