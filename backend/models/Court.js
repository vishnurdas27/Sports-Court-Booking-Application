const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Court = sequelize.define('Court', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('indoor', 'outdoor'),
        allowNull: false
    },
    basePrice: {                // ✅ USE basePrice
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 20.0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Court;
