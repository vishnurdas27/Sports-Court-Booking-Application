require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const courtRoutes = require('./routes/courtRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/courts', courtRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully!');
    return sequelize.authenticate();
  })
  .then(() => {
    console.log('Database connected!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Error connecting or syncing DB:', err);
  });
