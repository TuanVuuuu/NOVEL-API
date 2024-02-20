const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require("morgan");
const novelRouter = require("./routes/novel");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");


// Connect to DB
connectDB();

// Express App
const app = express();
const port = process.env.PORT || 8000;


app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("common"));
dotenv.config();

// GET START
app.get("/", async (req, res) => {
  try {
    const title = 'Server is running...';
    res.status(200).json({ title });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//ROUTES
app.use("/v1", novelRouter);

app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Server started listening on ${port}`)
);

process.on("unhandledRejection", (error, promise) => {
  console.log(`Logged Error: ${error}`);
  server.close(() => process.exit(1));
});