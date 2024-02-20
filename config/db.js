const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://adminaza:vJZwvUV70FUcWy8H@clusternovel.p7rn125.mongodb.net/?retryWrites=true&w=majority');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;