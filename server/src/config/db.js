import mongoose from 'mongoose';

/**
 * Connects Mongoose to MongoDB using MONGODB_URI from environment.
 * In production the URI should come from secrets / managed DB providers.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
