const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const PricingRule = sequelize.define('PricingRule',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('peak_hour','weekend','holiday'),
        allowNull: false
    },
    multiplier: {
        type: DataTypes.FLOAT,
        defaultValue:1.0
    },
    additionAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull:true
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull:true
    },
    applicableDays:{
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue:[]
    }
})

module.exports = PricingRule