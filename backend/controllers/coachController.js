const { Coach } = require('../models');

const getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.findAll({
      attributes: ['id', 'name', 'specialization', 'hourleyRate', 'isActive']
    });

    res.status(200).json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ message: 'Failed to retrieve coach list' });
  }
};

module.exports = { getCoaches };
