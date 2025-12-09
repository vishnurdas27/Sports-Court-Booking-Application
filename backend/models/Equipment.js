const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Equipment = sequelize.define('Equipment', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name: {
        type: DataTypes.STRING,
        allowNull:false
    },
    type: {
        type: DataTypes.ENUM('racket','shoes','shuttlecock'),
        allowNull: false
    },
    totalStock: {
        type: DataTypes.INTEGER,
        allowNull: false ,
        defaultValue: 0
    },
    pricePerUnit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    }
})

module.exports = Equipment