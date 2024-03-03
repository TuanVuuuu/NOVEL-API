const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://tuanvuadmin:vunt2022@novelaudio.yvmplzs.mongodb.net/?retryWrites=true&w=majority&appName=novelaudio');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;