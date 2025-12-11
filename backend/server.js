require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Imports the instance from models/index.js

const courtRoutes = require('./routes/courtRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const coachRoutes = require('./routes/coachRoutes');      // <-- ADD THIS
const equipmentRoutes = require('./routes/equipmentRoutes'); // <-- ADD THIS

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/courts', courtRoutes);
app.use('/bookings', bookingRoutes);
app.use('/coaches', coachRoutes);      
app.use('/equipment', equipmentRoutes)
app.use('/auth', require('./routes/authRoutes.js'));
app.use('/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;


sequelize.sync({ force: false}) 
  .then(() => {
    console.log('Database connected and synced!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Error syncing DB:', err);
  });