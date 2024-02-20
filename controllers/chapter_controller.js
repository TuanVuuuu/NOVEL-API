const puppeteer = require('puppeteer');
require('dotenv').config();
const { ChapterDetail } = require('../model/chapter_detail_model');

const LOCAL_HOST = 'http://localhost:8000'
const BASE_URL_NEW_NOVEL = 'https://metruyencv.com/truyen?sort_by=new_chap_at&props=1'
const BASE_URL = 'https://metruyencv.com'

const chapterController = {
    //GET CHAPTER CONTENT
    getChapterContent: async (req, res) => {
        try {

            const browser = await puppeteer.launch({ headless: "new" }); // Mở trình duyệt ở chế độ ẩn
            const page = await browser.newPage();
            await page.goto(BASE_URL + '/truyen/' + req.params.novel + '/chuong-' + req.params.chapter);

            await page.waitForSelector('#article', { timeout: 320000 });
            const novelInfo = await page.evaluate((paramsRequest) => {
                const chapterTextElement = document.querySelector('#article');
                let chapterTextLines = [];

                if (chapterTextElement) {
                    const chapterText = chapterTextElement.innerHTML.trim();
                    const div = document.createElement('div');
                    div.innerHTML = chapterText;
                    // Chia các dòng bởi thẻ <br>
                    chapterTextLines = chapterText.split('<br>');
                    // Loại bỏ các phần tử có chứa đoạn văn bản <div>
                    chapterTextLines = chapterTextLines.filter(line => !line.includes('<div'));
                }

                const chapterTitleDocument = document.querySelector('.h1.mb-4.font-weight-normal.nh-read__title')
                const chapterTitle = chapterTitleDocument ? chapterTitleDocument.textContent.trim() : ''
                return {
                    chapterTitle: chapterTitle,
                    chapterText: chapterTextLines,
                    novel: paramsRequest.novel,
                    chapterNumber: paramsRequest.chapter
                };
            }, req.params);
            await browser.close();

            // Kiểm tra xem đã có chương này trong MongoDB chưa
            const existingChapter = await ChapterDetail.findOne({ novel: novelInfo.novel, chapterNumber: novelInfo.chapterNumber });

            if (existingChapter) {
                // Nếu đã tồn tại, trả về nội dung của chương đã tồn tại
                console.log("Chapter already exists in MongoDB:", existingChapter);
                return res.status(200).json(existingChapter);
            } else {
                // Nếu chưa tồn tại, thêm mới vào MongoDB
                const newChapterDetail = new ChapterDetail(novelInfo);
                await newChapterDetail.save();
                console.log("Data added to MongoDB:", newChapterDetail);
                return res.status(200).json(novelInfo);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = chapterController;
