const { sequelize, Court, Coach, Equipment, PricingRule, User } = require('./models');

const seedDatabase = async () => {
  try {
    // ❗ Change to force: true ONLY if you want to reset database
    await sequelize.sync({ force: false});
    console.log('Database synced.');

    /* ---------------------------
     * 1️⃣ COURTS
     * --------------------------- */
    await Court.bulkCreate([
      { name: 'Court 1 (Indoor)', type: 'indoor', basePrice: 200 },
      { name: 'Court 2 (Indoor)', type: 'indoor', basePrice: 200 },
      { name: 'Court 3 (Outdoor)', type: 'outdoor', basePrice: 100 },
      { name: 'Court 4 (Outdoor)', type: 'outdoor', basePrice: 100 }
    ], { ignoreDuplicates: true });

    console.log('Courts created');

    /* ---------------------------
     * 2️⃣ COACHES
     * --------------------------- */
    await Coach.bulkCreate([
      { name: 'Coach Tovino', specialization: 'Beginner Training', hourleyRate: 150 },
      { name: 'Coach Basil', specialization: 'Advanced Training', hourleyRate: 250 },
      { name: 'Coach Kalyani', specialization: 'Competition Training', hourleyRate: 200 }
    ], { ignoreDuplicates: true });

    console.log('Coaches created');

    /* ---------------------------
     * 3️⃣ EQUIPMENT
     * --------------------------- */
    await Equipment.bulkCreate([
      { name: 'Yonex Professional Racket', type: 'racket', totalStock: 10, pricePerUnit: 20 },
      { name: 'Lightweight Training Racket', type: 'racket', totalStock: 20, pricePerUnit: 15 },
      { name: 'Feather Shuttlecock', type: 'shuttlecock', totalStock: 5, pricePerUnit: 12 },
      { name: 'Nylon Shuttlecock', type: 'shuttlecock', totalStock: 5, pricePerUnit: 10 }
    ], { ignoreDuplicates: true });

    console.log('Equipment created');

    /* ---------------------------
     * 4️⃣ PRICING RULES
     * --------------------------- */
    await PricingRule.bulkCreate([
      {
        name: 'Peak Hours (6PM - 9PM)',
        type: 'peak_hour',
        multiplier: 1.5,
        startTime: '18:00',
        endTime: '21:00'
      },
      {
        name: 'Weekend Surge',
        type: 'weekend',
        multiplier: 1.2,
        applicableDays: [0, 6]
      }
    ], { ignoreDuplicates: true });

    console.log('Pricing rules created');

    /* ---------------------------
     * 5️⃣ ADMIN USER
     * --------------------------- */
    await User.findOrCreate({
      where: { email: 'admin@sports.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@sports.com',
        password: 'password123',
        role: 'admin'
      }
    });

    console.log('Admin user created.');

    console.log('🌱 Seeding complete. Database is ready!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
