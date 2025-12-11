const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Coach = sequelize.define('Coach', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hourleyRate: {        // ✅ USE hourleyRate
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    isActive: {
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
});

module.exports = Coach;
