const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  }),
);

const sendError = (res, error = 'Something went wrong', code = 400) =>
  res.status(code).json({ error });

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    await User.create({ username, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ message: 'User registered successfully' });
  } catch {
    sendError(res);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, 'Invalid credentials');
    }

    res.json({
      username: user.username,
      message: `Welcome to your dashboard, ${user.username}!`,
    });
  } catch {
    sendError(res);
  }
});

mongoose
  .connect('mongodb://127.0.0.1:27017/practice2')
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch((err) => console.error('MongoDB connection error:', err.message));
