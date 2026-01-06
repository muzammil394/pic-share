import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import imageRoutes from './routes/images';

const app = express();

app.use(cors());
app.use(express.json());

// Register routes with proper prefixes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);

// Connect DB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Root route
app.get('/', (req, res) => {
  res.send('PicShare backend is running successfully!');
});