const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require("morgan");
const novelRouter = require("./routes/novel")
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.use(morgan("common"));
dotenv.config();

//CONNECT DATABASE
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB: ");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// GET TITLE WEBSITE
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://metruyencv.com' + '/');

  const title = await page.title();
  console.log(`Page title: ${title}`);
  await browser.close();
})();


// GET START
app.get("/", async (req, res) => {
  try {
    const title = 'Server is running...'
    res.status(200).json({ title });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//ROUTES
app.use("/v1", novelRouter)

app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});
