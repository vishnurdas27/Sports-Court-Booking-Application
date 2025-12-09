const {sequelize, Court, Coach, Equipment, PricingRule, User} = require('./models')

const seedDatabase= async () =>{
    try {
        await sequelize.sync({force:true})
        console.log('Database cleared and synced')

        const courts = await Court.bulkCreate([
            {name: 'Court 1 (Indoor)', type: 'indoor', basePrice: 200},
            { name: 'Court 2 (Indoor)', type: 'indoor', basePrice: 200 },
            { name: 'Court 3 (Outdoor)', type: 'outdoor', basePrice: 100 },
            { name: 'Court 4 (Outdoor)', type: 'outdoor', basePrice: 100 },
        ])
        console.log('Courts Created')

        const coaches = await Coach.bulkCreate([
            {name: 'Coach Tovino', specialization: 'Beginner Training', hourlyRate: 150 },
            {name: 'Coach Basil', specialization: 'Advanced Training', hourlyRate: 250 },
            {name: 'Coach Kalyani', specialization: 'Competition Training', hourlyRate: 200}
        ])
        console.log('Coaches Created.')

        const equipment = await Equipment.bulkCreate([
            { name: 'Yonex Professional Racket', type: 'racket', totalStock: 10, pricePerUnit: 20.0 },
            { name: 'Lightweight training racket', type: 'racket', totalStock: 20, pricePerUnit: 15.0 },
            { name: 'Feather shuttlecock', type: 'shuttlecock', totalStock: 5, pricePerUnit: 12.0 },
            { name: 'Nylon/plastic shuttlecock', type: 'shuttlecock', totalStock: 5, pricePerUnit: 10.0 },
        ])
        console.log('Equipment created.');

        const rules = await PricingRule.bulkCreate([
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
                applicableDays: [0,6]
            }
        ])
        console.log('Pricing Rules Created. ')

        await User.create({
            name: 'Admin User',
            email: 'admin@sports.com',
            password: 'password123',
            role: 'admin'
        })
        console.log('Admin user Created.')

        console.log('Seeding Complete! Database is ready to use. ')
        process.exit(0)
    }catch (error) {
        console.error('Seeding failed:',error)
        process.exit(1)
    }
}

seedDatabase()