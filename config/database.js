import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from our environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the process with failure
    process.exit(1);
  }
};