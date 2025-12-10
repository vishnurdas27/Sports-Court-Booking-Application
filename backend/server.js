require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Imports the instance from models/index.js

const courtRoutes = require('./routes/courtRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/courts', courtRoutes);
app.use('/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;


sequelize.sync({ force: false}) // <--- CHANGE THIS BACK TO { alter: true } AFTER FIRST RUN
  .then(() => {
    console.log('Database connected and synced!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Error syncing DB:', err);
  });