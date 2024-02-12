const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require("morgan");
const novelRouter = require("./routes/novel")

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.use(morgan("common"));
dotenv.config();

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL + '/');

  const title = await page.title();
  console.log(`Page title: ${title}`);

  await browser.close();
})();

//ROUTES
app.use("/v1", novelRouter)

app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});
