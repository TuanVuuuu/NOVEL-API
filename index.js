const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require("morgan");

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

app.get('/v1/:novel/page-:page', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true }); // Mở trình duyệt ở chế độ ẩn
    const page = await browser.newPage();
    await page.goto(process.env.BASE_URL + '/' + req.params.novel + '/trang-' + req.params.page + '/#list-chapter');
    const novelInfo = await page.evaluate((baseUrl) => {
      const chapters = Array.from(document.querySelectorAll('.list-chapter li')).map(li => {
        const linkElement = li.querySelector('a');
        const chapterUrl = linkElement.getAttribute('href');
        return {
          title: linkElement.textContent.trim(),
          url: baseUrl + '/v1' + chapterUrl.split(baseUrl)[1]
        };
      });
      return {
        chapters: chapters
      };
    }, process.env.BASE_URL);

    await browser.close();
    res.status(200).json(novelInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.name });
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});
