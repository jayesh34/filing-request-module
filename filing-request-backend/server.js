const express = require('express');
const cors = require('cors');
require('dotenv').config();

const filingRoutes = require('./routes/filingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/filings', filingRoutes);

app.get('/', (req, res) => {
  res.send('Filing backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});