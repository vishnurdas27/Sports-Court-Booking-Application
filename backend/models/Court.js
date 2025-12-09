const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Court = sequelize.define('Court',{
    name: {
        type: DataTypes.STRING,
        allowNull:false
    },
    type: {
        type: DataTypes.ENUM('indoor','outdoor'),
        allowNull:false
    },
    basePrice: {
        type: DataTypes.FLOAT,
        allowNull:false
    }
})

module.exports = Court