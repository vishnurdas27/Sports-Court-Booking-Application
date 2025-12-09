const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Booking = sequelize.define('Booking',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull:false
    },
    totalPrice: {
        type:DataTypes.FLOAT,
        allowNull:false
    },
    status: {
        type: DataTypes.ENUM('confirmed','pending','canceled','completed'),
        defaultValue: 'confirmed'
    },
    priceBreakdown:{
        type: DataTypes.JSON,
        allowNull:true
    }
})

module.exports=Booking