const {Court} = require('../models')

const getAllCourts = async (req, res)=> {
    try {
        const courts = await Court.findAll();
        res.status(200).json(courts)
    }catch (error) {
        console.log(error)
        res.status(500).json({message: 'Server Error'})
    }
}

module.exports = {getAllCourts}