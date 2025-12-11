const { Equipment } = require('../models');

const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({
      attributes: ['id', 'name', 'type', 'totalStock', 'pricePerUnit']
    });

    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Failed to retrieve equipment list' });
  }
};

module.exports = { getEquipment };
